import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkflowStep = 'upload' | 'crop' | 'background' | 'color' | 'download';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
}

const steps: { id: WorkflowStep; label: string; description: string }[] = [
  { id: 'upload', label: 'Upload', description: 'Choose your photo' },
  { id: 'crop', label: 'Crop', description: 'Adjust size' },
  { id: 'background', label: 'Background', description: 'Remove or keep' },
  { id: 'color', label: 'Color', description: 'Select background' },
  { id: 'download', label: 'Download', description: 'Save your photo' },
];

export default function WorkflowStepper({ currentStep, onStepClick }: WorkflowStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = index <= currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all',
                    'border-2',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-accent border-primary text-primary scale-110',
                    !isCompleted && !isCurrent && 'bg-muted border-border text-muted-foreground',
                    isClickable && 'cursor-pointer hover:scale-105',
                    !isClickable && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : index + 1}
                </button>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-foreground',
                      !isCompleted && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
