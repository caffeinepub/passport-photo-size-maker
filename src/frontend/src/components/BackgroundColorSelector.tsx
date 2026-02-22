import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { applyBackgroundColor } from '@/utils/applyBackground';

interface BackgroundColorSelectorProps {
  image: string;
  backgroundRemoved: boolean;
  onColorSelect: (imageWithBackground: string, color: string) => void;
  selectedColor: string;
  onBack: () => void;
}

const backgroundColors = [
  { name: 'White', value: '#FFFFFF', description: 'Most common' },
  { name: 'Black', value: '#000000', description: 'Formal' },
  { name: 'Blue', value: '#0000FF', description: 'Standard' },
];

export default function BackgroundColorSelector({
  image,
  backgroundRemoved,
  onColorSelect,
  selectedColor,
  onBack,
}: BackgroundColorSelectorProps) {
  const [previewImage, setPreviewImage] = useState<string>(image);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(selectedColor);

  useEffect(() => {
    if (backgroundRemoved) {
      applyBackgroundToPreview(currentColor);
    } else {
      setPreviewImage(image);
    }
  }, [currentColor, image, backgroundRemoved]);

  const applyBackgroundToPreview = async (color: string) => {
    setIsProcessing(true);
    try {
      const processedImage = await applyBackgroundColor(image, color);
      setPreviewImage(processedImage);
    } catch (error) {
      console.error('Error applying background:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  };

  const handleContinue = async () => {
    if (backgroundRemoved) {
      setIsProcessing(true);
      try {
        const finalImage = await applyBackgroundColor(image, currentColor);
        onColorSelect(finalImage, currentColor);
      } catch (error) {
        console.error('Error applying background:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      onColorSelect(image, currentColor);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Select Background Color</CardTitle>
          <CardDescription>
            {backgroundRemoved
              ? 'Choose a background color for your passport photo.'
              : 'Your original background will be kept.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-[3.5/4.5] bg-muted rounded-lg overflow-hidden">
              {isProcessing ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Applying background color...</p>
                </div>
              ) : backgroundRemoved ? (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #f3f4f6 0% 50%) 50% / 20px 20px',
                  }}
                >
                  <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                </div>
              ) : (
                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
              )}
            </div>
          </div>

          {backgroundRemoved && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Background Color</label>
              <div className="grid grid-cols-3 gap-4">
                {backgroundColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    disabled={isProcessing}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                      currentColor === color.value
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary hover:bg-accent/50',
                      isProcessing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className="w-16 h-16 rounded-full border-2 border-border"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="text-center">
                      <div className="font-medium text-sm">{color.name}</div>
                      <div className="text-xs text-muted-foreground">{color.description}</div>
                    </div>
                    {currentColor === color.value && (
                      <Check className="w-5 h-5 text-primary absolute top-2 right-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-between">
            <Button variant="outline" onClick={onBack} disabled={isProcessing}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleContinue} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
