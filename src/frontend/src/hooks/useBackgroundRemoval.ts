import { useState, useCallback } from 'react';
import { imageToBlob } from '@/utils/imageToBlob';
import { useGetBgRemoveApiKey } from './useQueries';

interface BackgroundRemovalState {
  processedImage: string | null;
  isProcessing: boolean;
  error: string | null;
}

export function useBackgroundRemoval() {
  const [state, setState] = useState<BackgroundRemovalState>({
    processedImage: null,
    isProcessing: false,
    error: null,
  });

  const { data: apiKey, isLoading: isLoadingApiKey, error: apiKeyError } = useGetBgRemoveApiKey();

  const removeBackgroundWithAPI = async (imageUrl: string, apiKey: string): Promise<string> => {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is not available. Please try again later.');
    }

    try {
      // Convert image to blob for FormData
      const imageBlob = await imageToBlob(imageUrl);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('image_file', imageBlob, 'image.png');
      formData.append('size', 'auto');
      
      // Call Remove.bg API
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 403) {
          throw new Error('Invalid API key. Please contact support.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later or contact support.');
        } else {
          // Try to parse error message from API
          try {
            const errorData = await response.json();
            const errorMessage = errorData.errors?.[0]?.title || errorData.error || 'Unknown error';
            throw new Error(`Background removal failed: ${errorMessage}`);
          } catch {
            throw new Error(`Background removal failed: HTTP ${response.status}`);
          }
        }
      }

      // Get the result as blob
      const resultBlob = await response.blob();
      
      // Convert to object URL for display
      const resultUrl = URL.createObjectURL(resultBlob);
      
      return resultUrl;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to Remove.bg. Please check your internet connection and try again.');
      }
      // Re-throw other errors
      throw error;
    }
  };

  const processImage = useCallback(async (imageUrl: string): Promise<string> => {
    setState({ processedImage: null, isProcessing: true, error: null });

    try {
      if (!apiKey) {
        throw new Error('API key is not available. Please try again.');
      }

      const processedUrl = await removeBackgroundWithAPI(imageUrl, apiKey);

      setState({
        processedImage: processedUrl,
        isProcessing: false,
        error: null,
      });

      return processedUrl;
    } catch (error) {
      console.error('Background removal error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Failed to remove background. Please try again or skip this step.';

      setState({
        processedImage: null,
        isProcessing: false,
        error: errorMessage,
      });

      throw error;
    }
  }, [apiKey]);

  const retry = useCallback(async (imageUrl: string): Promise<string> => {
    return processImage(imageUrl);
  }, [processImage]);

  return {
    processImage,
    retry,
    isProcessing: state.isProcessing,
    error: state.error,
    processedImage: state.processedImage,
    isLoadingApiKey,
    apiKeyError,
  };
}
