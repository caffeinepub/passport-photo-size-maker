import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Check } from 'lucide-react';
import { cropImageManual } from '@/utils/cropImage';

interface CropEditorProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onBack: () => void;
}

export default function CropEditor({ image, onCropComplete, onBack }: CropEditorProps) {
  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const aspectRatio = 3.5 / 4.5;

  // Load image and get dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load image');
      alert('Failed to load image. Please try again.');
    };
    img.src = image;
  }, [image]);

  // Calculate base scale to fit image in canvas
  useEffect(() => {
    if (!imageLoaded || !containerRef.current || imageDimensions.width === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate scale to fit image within canvas with some padding
    const scaleX = (containerRect.width * 0.9) / imageDimensions.width;
    const scaleY = (containerRect.height * 0.9) / imageDimensions.height;
    const fitScale = Math.min(scaleX, scaleY);
    
    setBaseScale(fitScale);
    setZoom(1); // Reset zoom to 1 (which will use the baseScale)
    setPosition({ x: 0, y: 0 }); // Reset position to center
  }, [imageLoaded, imageDimensions]);

  // Draw image on canvas whenever position, zoom, or image changes
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !containerRef.current || baseScale === 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Set canvas size to match container
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load and draw image
    const img = new Image();
    img.onload = () => {
      // Calculate scaled dimensions using baseScale and zoom
      const effectiveScale = baseScale * zoom;
      const scaledWidth = imageDimensions.width * effectiveScale;
      const scaledHeight = imageDimensions.height * effectiveScale;

      // Calculate position (centered + offset)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const x = centerX + position.x - scaledWidth / 2;
      const y = centerY + position.y - scaledHeight / 2;

      // Draw image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Draw crop overlay
      drawCropOverlay(ctx, canvas.width, canvas.height, effectiveScale);
    };
    img.src = image;
  }, [image, imageLoaded, imageDimensions, zoom, position, baseScale]);

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, effectiveScale: number) => {
    // Calculate crop box dimensions
    const cropWidth = Math.min(width * 0.8, height * 0.8 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const cropX = centerX - cropWidth / 2;
    const cropY = centerY - cropHeight / 2;

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);

    // Clear crop area
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);

    // Redraw image in crop area only
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cropX, cropY, cropWidth, cropHeight);
      ctx.clip();

      const scaledWidth = imageDimensions.width * effectiveScale;
      const scaledHeight = imageDimensions.height * effectiveScale;
      const x = centerX + position.x - scaledWidth / 2;
      const y = centerY + position.y - scaledHeight / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.restore();

      // Draw crop box border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let i = 1; i < 3; i++) {
        const x = cropX + (cropWidth / 3) * i;
        ctx.beginPath();
        ctx.moveTo(x, cropY);
        ctx.lineTo(x, cropY + cropHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 1; i < 3; i++) {
        const y = cropY + (cropHeight / 3) * i;
        ctx.beginPath();
        ctx.moveTo(cropX, y);
        ctx.lineTo(cropX + cropWidth, y);
        ctx.stroke();
      }
    };
    img.src = image;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCropConfirm = useCallback(async () => {
    if (!containerRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Calculate crop area dimensions
      const cropWidth = Math.min(containerRect.width * 0.8, containerRect.height * 0.8 * aspectRatio);
      const cropHeight = cropWidth / aspectRatio;
      
      // Calculate center of container
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      // Calculate crop box position (centered)
      const cropBoxX = centerX - cropWidth / 2;
      const cropBoxY = centerY - cropHeight / 2;
      
      // Calculate image position and size with zoom and baseScale
      const effectiveScale = baseScale * zoom;
      const imageWidth = imageDimensions.width * effectiveScale;
      const imageHeight = imageDimensions.height * effectiveScale;
      const imageX = centerX + position.x - imageWidth / 2;
      const imageY = centerY + position.y - imageHeight / 2;
      
      // Calculate crop area relative to the image
      const cropArea = {
        x: (cropBoxX - imageX) / effectiveScale,
        y: (cropBoxY - imageY) / effectiveScale,
        width: cropWidth / effectiveScale,
        height: cropHeight / effectiveScale,
      };

      const croppedImageUrl = await cropImageManual(image, cropArea);
      onCropComplete(croppedImageUrl);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [image, zoom, position, imageDimensions, aspectRatio, baseScale, onCropComplete]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Crop Your Photo</CardTitle>
          <CardDescription>
            Adjust the crop area to 3.5×4.5 cm passport size. Drag to reposition, use the slider to zoom.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            ref={containerRef}
            className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground">Loading image...</p>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
              disabled={!imageLoaded}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onBack} disabled={isProcessing}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleCropConfirm} disabled={isProcessing || !imageLoaded}>
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Crop
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
