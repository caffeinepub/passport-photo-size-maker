import { useState, useCallback } from 'react';

interface CropState {
  x: number;
  y: number;
  zoom: number;
}

export function useCropState(initialZoom = 1) {
  const [crop, setCrop] = useState<CropState>({
    x: 0,
    y: 0,
    zoom: initialZoom,
  });

  const updateCrop = useCallback((updates: Partial<CropState>) => {
    setCrop((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetCrop = useCallback(() => {
    setCrop({ x: 0, y: 0, zoom: initialZoom });
  }, [initialZoom]);

  return {
    crop,
    updateCrop,
    resetCrop,
  };
}
