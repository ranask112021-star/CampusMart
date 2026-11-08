import { v2 as cloudinary } from "cloudinary";

const configure = () =>
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

export const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    configure();
    const stream = cloudinary.uploader.upload_stream(
      { folder: "campusmart" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

export const deleteImage = async (publicId) => {
  configure();
  await cloudinary.uploader.destroy(publicId);
};