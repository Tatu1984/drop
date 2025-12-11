import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadFile, validateFile, getSignedUploadUrl } from '@/lib/upload';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Upload file
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return errorResponse(validation.error || 'Invalid file', 400);
    }

    // Upload file
    const result = await uploadFile(file, folder);

    return successResponse({
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Failed to upload file', 500);
  }
}

// Get signed upload URL for client-side uploads
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'uploads';

    const uploadData = getSignedUploadUrl(folder);

    return successResponse(uploadData);
  } catch (error) {
    console.error('Get upload URL error:', error);
    return errorResponse('Failed to get upload URL', 500);
  }
}
