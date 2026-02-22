import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import WorkflowStepper from './components/WorkflowStepper';
import ImageUploader from './components/ImageUploader';
import CropEditor from './components/CropEditor';
import BackgroundRemover from './components/BackgroundRemover';
import BackgroundColorSelector from './components/BackgroundColorSelector';
import DownloadControls from './components/DownloadControls';

const queryClient = new QueryClient();

type WorkflowStep = 'upload' | 'crop' | 'background' | 'color' | 'download';

function AppContent() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setCurrentStep('crop');
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setProcessedImage(croppedImageUrl);
    setCurrentStep('background');
  };

  const handleBackgroundRemove = (removedBgImage: string) => {
    setProcessedImage(removedBgImage);
    setBackgroundRemoved(true);
    setCurrentStep('color');
  };

  const handleSkipBackgroundRemoval = () => {
    setProcessedImage(croppedImage);
    setBackgroundRemoved(false);
    setCurrentStep('color');
  };

  const handleColorSelect = (imageWithBackground: string, color: string) => {
    setFinalImage(imageWithBackground);
    setBackgroundColor(color);
    setCurrentStep('download');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedImage(null);
    setCroppedImage(null);
    setProcessedImage(null);
    setFinalImage(null);
    setBackgroundColor('#FFFFFF');
    setBackgroundRemoved(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Passport Photo Size Maker</h1>
          <p className="text-lg text-muted-foreground">Create perfect 3.5×4.5 cm passport photos in minutes</p>
        </div>

        <WorkflowStepper currentStep={currentStep} onStepClick={setCurrentStep} />

        <div className="mt-8">
          {currentStep === 'upload' && (
            <ImageUploader onImageUpload={handleImageUpload} />
          )}

          {currentStep === 'crop' && uploadedImage && (
            <CropEditor
              image={uploadedImage}
              onCropComplete={handleCropComplete}
              onBack={() => setCurrentStep('upload')}
            />
          )}

          {currentStep === 'background' && croppedImage && (
            <BackgroundRemover
              image={croppedImage}
              onBackgroundRemove={handleBackgroundRemove}
              onSkip={handleSkipBackgroundRemoval}
              onBack={() => setCurrentStep('crop')}
            />
          )}

          {currentStep === 'color' && processedImage && (
            <BackgroundColorSelector
              image={processedImage}
              backgroundRemoved={backgroundRemoved}
              onColorSelect={handleColorSelect}
              selectedColor={backgroundColor}
              onBack={() => setCurrentStep('background')}
            />
          )}

          {currentStep === 'download' && finalImage && (
            <DownloadControls
              image={finalImage}
              backgroundColor={backgroundColor}
              backgroundRemoved={backgroundRemoved}
              onReset={handleReset}
              onBack={() => setCurrentStep('color')}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
