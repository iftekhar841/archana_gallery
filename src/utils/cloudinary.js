const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary.
 * @param {object} file - The uploaded image file object.
 * @param {string} folder - The folder name where the image should be stored.
 * @returns {Promise<string>} - Secure URL of the uploaded image.
 */
const uploadImageToCloudinary = async (file, folder) => {
  try {
    if (!file) {
      throw new Error("No file provided for upload.");
    }

    // Convert image buffer to base64
    const imageBuffer = file.data.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${imageBuffer}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      use_filename: true, // Uses the original filename
      unique_filename: false, // Prevents Cloudinary from renaming the file
      resource_type: "auto", // Auto-detects the file type
    });

    console.log("Cloudinary Upload Success:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    if (error.http_code === 400) {
      throw new Error("Invalid image format or corrupted file.");
    } else if (error.http_code === 401) {
      throw new Error("Unauthorized! Check your Cloudinary API credentials.");
    } else {
      throw new Error("Image upload failed. Please try again later.");
    }
  }
};

module.exports = uploadImageToCloudinary;
