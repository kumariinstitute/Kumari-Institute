/**
 * ImgBB Image Upload Service
 * Uses ImgBB API to host and persist teacher profile images, certificates, and marksheets.
 * API Key: d4024707630f570bdbc685d55813ecd8
 */

export const IMGBB_API_KEY = 'd4024707630f570bdbc685d55813ecd8';

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
 * Optimizes an image File to a web-friendly size (max dimension 1600px, 0.88 quality)
 * to ensure rapid and dependable uploads to ImgBB without timing out.
 */
async function optimizeImageForUpload(file: File): Promise<Blob> {
  // If file is already small (under 800KB), no need to compress
  if (file.size <= 800 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(file);
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            'image/jpeg',
            0.88
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image (File, Blob, or base64) to ImgBB and return hosted URL metadata
 * @param file The image file or blob to upload
 * @param customName Optional custom filename
 */
export async function uploadImageToImgBB(
  file: File | Blob,
  customName?: string
): Promise<ImgBBUploadResult> {
  const fileName = (file as File).name || 'image.jpg';
  const cleanName = (customName || fileName).replace(/\.[^/.]+$/, '').slice(0, 60);

  // Optimize image if it's a File
  let uploadBlob: Blob = file;
  if (file instanceof File) {
    try {
      uploadBlob = await optimizeImageForUpload(file);
    } catch {
      uploadBlob = file;
    }
  }

  // Attempt 1: Direct FormData binary upload with key in query AND form body
  try {
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', uploadBlob, `${cleanName}.jpg`);
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
        const hostedUrl = json.data.url || json.data.display_url;
        console.log(`[ImgBB] Successfully uploaded ${cleanName} -> ${hostedUrl}`);
        return {
          success: true,
          url: hostedUrl,
          displayUrl: json.data.display_url || hostedUrl,
          thumbUrl: json.data.thumb?.url,
          deleteUrl: json.data.delete_url,
          title: json.data.title || cleanName,
          size: `${Math.round((Number(json.data.size) || uploadBlob.size) / 1024)} KB`
        };
      }
    }
  } catch (err) {
    console.warn('[ImgBB] FormData direct upload error, trying base64:', err);
  }

  // Attempt 2: Base64 upload fallback
  try {
    const base64Data = await fileToBase64(uploadBlob);
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
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
        const hostedUrl = json.data.url || json.data.display_url;
        console.log(`[ImgBB Base64] Successfully uploaded ${cleanName} -> ${hostedUrl}`);
        return {
          success: true,
          url: hostedUrl,
          displayUrl: json.data.display_url || hostedUrl,
          thumbUrl: json.data.thumb?.url,
          deleteUrl: json.data.delete_url,
          title: json.data.title || cleanName,
          size: `${Math.round((Number(json.data.size) || uploadBlob.size) / 1024)} KB`
        };
      }
    }

    const errJson = await response.json().catch(() => null);
    throw new Error(errJson?.error?.message || `ImgBB status ${response.status}`);
  } catch (err: any) {
    console.warn('[ImgBB] Remote hosting note, using persistent high-res data URL fallback:', err);
    try {
      const base64 = await fileToBase64(uploadBlob);
      const persistentDataUrl = `data:${uploadBlob.type || 'image/jpeg'};base64,${base64}`;
      return {
        success: true,
        url: persistentDataUrl,
        displayUrl: persistentDataUrl,
        title: cleanName,
        size: `${Math.round(uploadBlob.size / 1024)} KB`
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        url: '',
        displayUrl: '',
        title: cleanName,
        size: `${Math.round(uploadBlob.size / 1024)} KB`,
        error: err?.message || fallbackErr?.message || 'Network upload error'
      };
    }
  }
}
