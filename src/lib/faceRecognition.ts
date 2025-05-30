import * as faceapi from 'face-api.js';

// Flag to track if models are loaded
let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Initialize face-api.js models
 * This needs to be called before any face detection can happen
 */
export async function initFaceDetection() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;
  
  try {
    // Load models from public directory
    const MODEL_URL = '/models';
    
    // Create a loading promise to prevent multiple simultaneous loading attempts
    loadingPromise = (async () => {
      try {
        // Load required models for face detection in sequence to avoid race conditions
        await faceapi.nets.tinyFaceDetector.load(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.load(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.load(MODEL_URL);
        
        // Verify models are loaded
        if (!faceapi.nets.tinyFaceDetector.isLoaded) {
          throw new Error('TinyFaceDetector model failed to load');
        }
        if (!faceapi.nets.faceLandmark68Net.isLoaded) {
          throw new Error('FaceLandmark68Net model failed to load');
        }
        if (!faceapi.nets.faceRecognitionNet.isLoaded) {
          throw new Error('FaceRecognitionNet model failed to load');
        }
        
        modelsLoaded = true;
        console.log('Face detection models loaded successfully');
      } catch (error) {
        console.error('Error loading face detection models:', error);
        modelsLoaded = false;
        throw new Error('Failed to load face detection models. Please check the console for details.');
      } finally {
        loadingPromise = null;
      }
    })();
    
    return loadingPromise;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    modelsLoaded = false;
    throw new Error('Failed to load face detection models. Please check the console for details.');
  }
}

/**
 * Detect faces in an image
 * @param imageElement HTML image element or canvas with the photo
 * @returns Detection results or null if no face detected
 */
export async function detectFace(imageElement: HTMLImageElement | HTMLCanvasElement) {
  try {
    // Ensure models are loaded
    if (!modelsLoaded) {
      await initFaceDetection();
    }
    
    // Configure face detector options with smaller input size
    const options = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 160  // Reduced from 320 to match model expectations
    });
    
    // Detect all faces and landmarks in the image
    const detections = await faceapi.detectAllFaces(
      imageElement,
      options
    ).withFaceLandmarks().withFaceDescriptors();
    
    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return null;
  }
}

/**
 * Validate a check-in photo
 * @param photo Blob of the photo to validate
 * @returns Validation result with face count and confidence
 */
export async function validateCheckInPhoto(photo: Blob): Promise<{
  isValid: boolean;
  faceCount: number;
  confidence: number;
  message: string;
}> {
  try {
    // Create an image element from the blob
    const img = document.createElement('img');
    img.src = URL.createObjectURL(photo);
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Detect faces in the image
    const detections = await detectFace(img);
    
    // Clean up the object URL
    URL.revokeObjectURL(img.src);
    
    // No detections or error
    if (!detections || detections.length === 0) {
      return {
        isValid: false,
        faceCount: 0,
        confidence: 0,
        message: 'No face detected in the image'
      };
    }
    
    // Too many faces detected
    if (detections.length > 1) {
      return {
        isValid: false,
        faceCount: detections.length,
        confidence: 0,
        message: 'Multiple faces detected in the image'
      };
    }
    
    // Get the confidence score of the detection
    const detection = detections[0];
    const confidence = detection.detection.score;
    
    // Validate based on confidence threshold
    const isValid = confidence > 0.7; // Minimum 70% confidence
    
    return {
      isValid,
      faceCount: 1,
      confidence,
      message: isValid 
        ? 'Face validated successfully' 
        : 'Face detected but confidence too low'
    };
  } catch (error) {
    console.error('Error validating check-in photo:', error);
    return {
      isValid: false,
      faceCount: 0,
      confidence: 0,
      message: error instanceof Error ? error.message : 'Error validating photo'
    };
  }
}

/**
 * Compare two face images to verify if they are the same person
 * @param referencePhoto Reference photo blob (e.g., profile picture)
 * @param checkInPhoto New check-in photo blob
 * @returns Comparison result with match score
 */
export async function compareFaces(referencePhoto: Blob, checkInPhoto: Blob): Promise<{
  isMatch: boolean;
  matchScore: number;
  message: string;
}> {
  try {
    // Create image elements from the blobs
    const refImg = document.createElement('img');
    refImg.src = URL.createObjectURL(referencePhoto);
    
    const checkImg = document.createElement('img');
    checkImg.src = URL.createObjectURL(checkInPhoto);
    
    // Wait for both images to load
    await Promise.all([
      new Promise((resolve, reject) => { 
        refImg.onload = resolve;
        refImg.onerror = reject;
      }),
      new Promise((resolve, reject) => { 
        checkImg.onload = resolve;
        checkImg.onerror = reject;
      })
    ]);
    
    // Detect faces in both images
    const refDetections = await detectFace(refImg);
    const checkDetections = await detectFace(checkImg);
    
    // Clean up the object URLs
    URL.revokeObjectURL(refImg.src);
    URL.revokeObjectURL(checkImg.src);
    
    // Validate detections
    if (!refDetections || refDetections.length === 0) {
      return {
        isMatch: false,
        matchScore: 0,
        message: 'No face detected in reference photo'
      };
    }
    
    if (!checkDetections || checkDetections.length === 0) {
      return {
        isMatch: false,
        matchScore: 0,
        message: 'No face detected in check-in photo'
      };
    }
    
    // Get descriptors
    const refDescriptor = refDetections[0].descriptor;
    const checkDescriptor = checkDetections[0].descriptor;
    
    // Calculate Euclidean distance between face descriptors
    const distance = faceapi.euclideanDistance(refDescriptor, checkDescriptor);
    
    // Convert distance to similarity score (0-1)
    // Lower distance means higher similarity
    const matchScore = Math.max(0, 1 - distance);
    
    // Threshold for considering it a match (0.6 is a reasonable threshold)
    const isMatch = matchScore > 0.6;
    
    return {
      isMatch,
      matchScore,
      message: isMatch 
        ? 'Face match confirmed' 
        : 'Face does not match reference photo'
    };
  } catch (error) {
    console.error('Error comparing faces:', error);
    return {
      isMatch: false,
      matchScore: 0,
      message: error instanceof Error ? error.message : 'Error comparing faces'
    };
  }
}