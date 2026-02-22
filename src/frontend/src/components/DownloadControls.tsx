import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, ArrowLeft } from 'lucide-react';
import { downloadImage } from '@/utils/downloadImage';
import { applyBackgroundColor } from '@/utils/applyBackground';

interface DownloadControlsProps {
  image: string;
  backgroundColor: string;
  backgroundRemoved: boolean;
  onReset: () => void;
  onBack: () => void;
}

export default function DownloadControls({
  image,
  backgroundColor,
  backgroundRemoved,
  onReset,
  onBack,
}: DownloadControlsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [finalImage, setFinalImage] = useState<string>(image);

  const handleDownload = async (format: 'jpg' | 'png') => {
    setIsDownloading(true);
    try {
      let imageToDownload = image;
      
      // Apply background color if background was removed
      if (backgroundRemoved && backgroundColor !== '#FFFFFF') {
        imageToDownload = await applyBackgroundColor(image, backgroundColor);
      }

      await downloadImage(imageToDownload, format);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Download Your Passport Photo</CardTitle>
          <CardDescription>
            Your photo is ready! Download it in JPG or PNG format at 300 DPI (413×531 pixels).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-[3.5/4.5] bg-muted rounded-lg overflow-hidden shadow-lg">
              <img src={image} alt="Final passport photo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm">Photo Specifications:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Size: 3.5 × 4.5 cm (413 × 531 pixels)</li>
              <li>• Resolution: 300 DPI (print-ready)</li>
              <li>• Background: {backgroundRemoved ? `${backgroundColor} color` : 'Original'}</li>
              <li>• Format: JPG or PNG</li>
            </ul>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Download Format</label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleDownload('jpg')}
                disabled={isDownloading}
                size="lg"
                className="h-auto py-4"
              >
                <div className="flex flex-col items-center gap-1">
                  <Download className="w-5 h-5" />
                  <span className="font-semibold">Download JPG</span>
                  <span className="text-xs opacity-80">Smaller file size</span>
                </div>
              </Button>
              <Button
                onClick={() => handleDownload('png')}
                disabled={isDownloading}
                variant="outline"
                size="lg"
                className="h-auto py-4"
              >
                <div className="flex flex-col items-center gap-1">
                  <Download className="w-5 h-5" />
                  <span className="font-semibold">Download PNG</span>
                  <span className="text-xs opacity-80">Higher quality</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="flex gap-3 justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
