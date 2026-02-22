/**
 * Converts a base64 data URL or blob URL to a Blob object
 * suitable for FormData submission to Remove.bg API
 */
export async function imageToBlob(imageUrl: string): Promise<Blob> {
  // If it's already a blob URL, fetch it directly
  if (imageUrl.startsWith('blob:')) {
    const response = await fetch(imageUrl);
    return await response.blob();
  }
  
  // If it's a data URL, extract and convert
  if (imageUrl.startsWith('data:')) {
    const parts = imageUrl.split(',');
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format');
    }
    
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    
    const base64Data = parts[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([bytes], { type: mimeType });
  }
  
  // For regular URLs, fetch them
  const response = await fetch(imageUrl);
  return await response.blob();
}
