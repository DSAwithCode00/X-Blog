import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};
const deleteFromCloudinary = async (filePath) => {
  try {
    if (!filePath || typeof filePath !== "string")
      throw new ApiError(400, "Invalid File Path");
    const extractFilePath = filePath.split("/").pop();
    const publicId = extractFilePath.split( ".")[0];
    const response = await cloudinary.uploader.destroy(publicId);
    if (response?.result !== "ok")
      throw new ApiError(500, "Failed to Delete file from Cloudinary");
    return response;
  } catch (error) {
    throw new ApiError(500, "Unable to Delete file :", error.message,error);
  }
};
export { deleteFromCloudinary, uploadOnCloudinary };

