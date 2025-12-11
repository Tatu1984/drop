// File upload utilities
// In production, integrate with Cloudinary, AWS S3, or similar

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
}

// Simulated upload for development
export async function uploadFile(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  // In production, use Cloudinary:
  // const cloudinary = require('cloudinary').v2;
  // cloudinary.config({
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  //   api_key: process.env.CLOUDINARY_API_KEY,
  //   api_secret: process.env.CLOUDINARY_API_SECRET,
  // });
  //
  // const buffer = await file.arrayBuffer();
  // const base64 = Buffer.from(buffer).toString('base64');
  // const dataUri = `data:${file.type};base64,${base64}`;
  //
  // const result = await cloudinary.uploader.upload(dataUri, {
  //   folder,
  //   resource_type: 'auto',
  // });
  //
  // return {
  //   url: result.secure_url,
  //   publicId: result.public_id,
  //   format: result.format,
  //   width: result.width,
  //   height: result.height,
  // };

  // Development mock
  const mockId = `${folder}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
  return {
    url: `https://res.cloudinary.com/demo/image/upload/${mockId}`,
    publicId: mockId,
    format: file.type.split('/')[1] || 'jpg',
  };
}

// Delete file
export async function deleteFile(publicId: string): Promise<boolean> {
  // In production:
  // const cloudinary = require('cloudinary').v2;
  // await cloudinary.uploader.destroy(publicId);

  console.log(`[Mock] Deleted file: ${publicId}`);
  return true;
}

// Upload multiple files
export async function uploadFiles(
  files: File[],
  folder: string = 'uploads'
): Promise<UploadResult[]> {
  return Promise.all(files.map(file => uploadFile(file, folder)));
}

// Generate signed upload URL for client-side uploads
export function getSignedUploadUrl(folder: string = 'uploads'): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
} {
  // In production:
  // const cloudinary = require('cloudinary').v2;
  // const timestamp = Math.round(Date.now() / 1000);
  // const signature = cloudinary.utils.api_sign_request(
  //   { timestamp, folder },
  //   process.env.CLOUDINARY_API_SECRET
  // );
  //
  // return {
  //   signature,
  //   timestamp,
  //   cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  //   apiKey: process.env.CLOUDINARY_API_KEY,
  // };

  return {
    signature: 'mock_signature',
    timestamp: Math.round(Date.now() / 1000),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    apiKey: process.env.CLOUDINARY_API_KEY || 'demo_key',
  };
}

// Validate file type and size
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}
