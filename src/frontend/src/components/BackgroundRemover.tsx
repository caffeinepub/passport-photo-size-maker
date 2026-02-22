import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Scissors, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';

interface BackgroundRemoverProps {
  image: string;
  onBackgroundRemove: (processedImage: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function BackgroundRemover({
  image,
  onBackgroundRemove,
  onSkip,
  onBack,
}: BackgroundRemoverProps) {
  const { processImage, isProcessing, error, processedImage, retry, isLoadingApiKey, apiKeyError } = useBackgroundRemoval();

  const handleRemoveBackground = async () => {
    try {
      const result = await processImage(image);
      onBackgroundRemove(result);
    } catch (error) {
      console.error('Error removing background:', error);
    }
  };

  const handleRetry = async () => {
    try {
      const result = await retry(image);
      onBackgroundRemove(result);
    } catch (error) {
      console.error('Error retrying background removal:', error);
    }
  };

  const isLoading = isProcessing || isLoadingApiKey;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Professional Background Removal
          </CardTitle>
          <CardDescription>
            Powered by Remove.bg API for clean, artifact-free results in 3-5 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-[3.5/4.5] bg-muted rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm p-8">
                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-foreground">
                        {isLoadingApiKey ? 'Initializing...' : 'Processing with professional AI...'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isLoadingApiKey ? 'Please wait' : 'This typically takes 3-5 seconds'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : processedImage ? (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #f3f4f6 0% 50%) 50% / 20px 20px',
                  }}
                >
                  <img src={processedImage} alt="Background Removed" className="w-full h-full object-contain" />
                </div>
              ) : (
                <img src={image} alt="Cropped" className="w-full h-full object-contain" />
              )}
            </div>
          </div>

          {/* Error Display */}
          {(error || apiKeyError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Background Removal Failed</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>{error || 'Failed to load API key. Please try again.'}</p>
                  <p className="text-sm">You can retry or skip this step to continue with the original image.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          {!error && !apiKeyError && !processedImage && !isLoading && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Professional Quality:</strong> Remove.bg uses advanced AI to remove backgrounds cleanly without artifacts. Click "Remove Background" to get started.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-between">
            <Button variant="outline" onClick={onBack} disabled={isLoading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-3">
              {(error || apiKeyError) ? (
                <>
                  <Button variant="outline" onClick={onSkip}>
                    Skip & Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button onClick={handleRetry} disabled={isLoadingApiKey}>
                    <Scissors className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={onSkip} disabled={isLoading}>
                    Skip
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {!processedImage ? (
                    <Button onClick={handleRemoveBackground} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isLoadingApiKey ? 'Initializing...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <Scissors className="w-4 h-4 mr-2" />
                          Remove Background
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={() => onBackgroundRemove(processedImage)}>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
