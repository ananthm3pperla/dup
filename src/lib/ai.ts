import { Configuration, OpenAIApi } from 'openai';
import { MemoryCache } from './cache';

const cache = new MemoryCache();

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function analyzeSentiment(text: string) {
  const cacheKey = `sentiment:${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Analyze the sentiment of this text and respond with only "positive", "negative", or "neutral": "${text}"`,
      max_tokens: 1,
      temperature: 0,
    });

    const sentiment = completion.data.choices[0].text?.trim().toLowerCase() as 'positive' | 'negative' | 'neutral';
    const result = {
      sentiment,
      confidence: completion.data.choices[0].logprobs?.token_logprobs?.[0] || 0.8
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to basic sentiment analysis if API fails
    return analyzeBasicSentiment(text);
  }
}

function analyzeBasicSentiment(text: string) {
  const words = text.toLowerCase().split(/\s+/);
  
  const positiveWords = new Set([
    'great', 'excellent', 'good', 'happy', 'productive',
    'helpful', 'effective', 'successful', 'positive', 'progress'
  ]);
  
  const negativeWords = new Set([
    'bad', 'poor', 'unhappy', 'unproductive', 'difficult',
    'challenging', 'frustrated', 'negative', 'issue', 'problem'
  ]);
  
  let score = 0;
  let matchedWords = 0;
  
  words.forEach(word => {
    if (positiveWords.has(word)) {
      score += 1;
      matchedWords++;
    } else if (negativeWords.has(word)) {
      score -= 1;
      matchedWords++;
    }
  });
  
  const confidence = matchedWords / words.length;
  const normalizedScore = score / (matchedWords || 1);
  
  return {
    sentiment: normalizedScore > 0.2 ? 'positive' : 
               normalizedScore < -0.2 ? 'negative' : 
               'neutral',
    confidence: Math.min(confidence * 2, 1)
  };
}

export async function generateMeetingSummary(transcript: string) {
  try {
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Summarize the key points from this meeting transcript:\n\n${transcript}\n\nKey points:`,
      max_tokens: 150,
      temperature: 0.3,
    });

    return completion.data.choices[0].text?.trim() || 'No summary available';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Failed to generate meeting summary';
  }
}

export async function suggestActionItems(transcript: string) {
  try {
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Extract action items from this meeting transcript. Format as JSON array with title and assignee properties:\n\n${transcript}`,
      max_tokens: 200,
      temperature: 0.3,
    });

    const response = completion.data.choices[0].text?.trim() || '[]';
    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return [];
  }
}

export async function recommendResources(context: string) {
  try {
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Suggest relevant resources based on this context. Format as JSON array with title and type properties:\n\n${context}`,
      max_tokens: 150,
      temperature: 0.3,
    });

    const response = completion.data.choices[0].text?.trim() || '[]';
    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return [];
  }
}