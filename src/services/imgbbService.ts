/**
 * ImgBB Image Upload Service
 * Uses ImgBB API to host and persist teacher profile images, certificates, and marksheets.
 */

export const IMGBB_API_KEY = 'ae6c7aa5fc50f949d8947f0a375bb74e';

export interface ImgBBUploadResult {
  success: boolean;
  url: string;
  displayUrl: string;
  thumbUrl?: string;
  deleteUrl?: string;
  title: string;
  size: string;
  error?: string;
}

/**
 * Converts a File or Blob into a raw base64 string (without the data URL prefix)
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload an image to ImgBB and return hosted URL metadata
 * @param file The image file to upload
 * @param customName Optional custom filename
 */
export async function uploadImageToImgBB(
  file: File,
  customName?: string
): Promise<ImgBBUploadResult> {
  const cleanName = (customName || file.name).replace(/\.[^/.]+$/, '');

  // Attempt 1: Direct FormData binary upload
  try {
    const formData = new FormData();
    formData.append('image', file);
    if (cleanName) {
      formData.append('name', cleanName);
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return {
          success: true,
          url: json.data.url,
          displayUrl: json.data.display_url || json.data.url,
          thumbUrl: json.data.thumb?.url,
          deleteUrl: json.data.delete_url,
          title: json.data.title || cleanName,
          size: `${Math.round((Number(json.data.size) || file.size) / 1024)} KB`
        };
      }
    }
  } catch (err) {
    console.warn('[ImgBB] FormData direct upload failed, attempting base64 fallback:', err);
  }

  // Attempt 2: Base64 upload fallback
  try {
    const base64Data = await fileToBase64(file);
    const formData = new FormData();
    formData.append('image', base64Data);
    if (cleanName) {
      formData.append('name', cleanName);
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return {
          success: true,
          url: json.data.url,
          displayUrl: json.data.display_url || json.data.url,
          thumbUrl: json.data.thumb?.url,
          deleteUrl: json.data.delete_url,
          title: json.data.title || cleanName,
          size: `${Math.round((Number(json.data.size) || file.size) / 1024)} KB`
        };
      }
    }

    const errJson = await response.json().catch(() => null);
    throw new Error(errJson?.error?.message || `ImgBB upload failed with status ${response.status}`);
  } catch (err: any) {
    console.warn('[ImgBB] External upload note, generating persistent data URL fallback:', err);
    try {
      const base64 = await fileToBase64(file);
      const persistentDataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;
      return {
        success: true,
        url: persistentDataUrl,
        displayUrl: persistentDataUrl,
        title: cleanName,
        size: `${Math.round(file.size / 1024)} KB`
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        url: '',
        displayUrl: '',
        title: cleanName,
        size: `${Math.round(file.size / 1024)} KB`,
        error: err?.message || fallbackErr?.message || 'Network upload error'
      };
    }
  }
}
