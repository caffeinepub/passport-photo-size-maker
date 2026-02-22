import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        alert('Please upload a valid image file (JPG, PNG, or WEBP)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
        setIsLoading(false);
      };
      reader.onerror = () => {
        alert('Failed to read file');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Photo</CardTitle>
          <CardDescription>
            Choose a clear photo of yourself with good lighting. Supported formats: JPG, PNG, WEBP (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-all',
              isDragging ? 'border-primary bg-accent' : 'border-border hover:border-primary hover:bg-accent/50',
              isLoading && 'opacity-50 pointer-events-none'
            )}
          >
            <div className="flex flex-col items-center gap-4">
              {isLoading ? (
                <>
                  <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-muted-foreground">Loading your image...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {isDragging ? (
                      <ImageIcon className="w-8 h-8 text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-1">
                      {isDragging ? 'Drop your image here' : 'Drag and drop your image here'}
                    </p>
                    <p className="text-sm text-muted-foreground">or</p>
                  </div>
                  <label htmlFor="file-upload">
                    <Button asChild>
                      <span className="cursor-pointer">Browse Files</span>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
