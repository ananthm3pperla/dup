import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodType<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } 
    // Handle nested fields (e.g., 'profile.name')
    else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setValues(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } 
    // Handle regular inputs
    else {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name as keyof T]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof T];
        return newErrors;
      });
    }
  }, [errors]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    
    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors: Partial<Record<keyof T, string>> = {};
        err.errors.forEach(error => {
          const path = error.path[0] as keyof T;
          formattedErrors[path] = error.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    setValue,
    handleSubmit,
    reset,
    validate
  };
}