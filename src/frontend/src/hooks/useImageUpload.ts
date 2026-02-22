import { useState, useCallback } from 'react';

interface ImageUploadState {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useImageUpload() {
  const [state, setState] = useState<ImageUploadState>({
    imageUrl: null,
    isLoading: false,
    error: null,
  });

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      return 'Please upload a valid image file (JPG, PNG, or WEBP)';
    }

    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }

    return null;
  }, []);

  const uploadImage = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const validationError = validateFile(file);
        if (validationError) {
          setState({ imageUrl: null, isLoading: false, error: validationError });
          reject(new Error(validationError));
          return;
        }

        setState({ imageUrl: null, isLoading: true, error: null });

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setState({ imageUrl: result, isLoading: false, error: null });
          resolve(result);
        };
        reader.onerror = () => {
          const error = 'Failed to read file';
          setState({ imageUrl: null, isLoading: false, error });
          reject(new Error(error));
        };
        reader.readAsDataURL(file);
      });
    },
    [validateFile]
  );

  const clearImage = useCallback(() => {
    setState({ imageUrl: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    uploadImage,
    clearImage,
  };
}
