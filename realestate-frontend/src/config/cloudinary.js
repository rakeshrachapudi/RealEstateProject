const CLOUDINARY_CONFIG = {
  cloudName: 'diw5av4fw',
  uploadPreset: 'root',
  // apiSecret removed for security - never expose this on frontend!
};

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const uploadMultipleImages = async (files) => {
  const uploadPromises = files.map(file => uploadImageToCloudinary(file));
  const results = await Promise.all(uploadPromises);
  return results.filter(result => result.success);
};

export default CLOUDINARY_CONFIG;