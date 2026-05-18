import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = (buffer, folder = 'smart-crm') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export default uploadToCloudinary;
