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

// Function to delete the video and images from the cloudinary
const deleteImageToCloudinary = async (publicIds, resourceType = "image") => {
  if (!publicIds || publicIds.length === 0) return null;

  publicIds = Array.isArray(publicIds) ? publicIds : [publicIds];

  const deletedItems = [];

  for (const publicId of publicIds) {
    try {
      console.log(`🚀 Deleting from Cloudinary: ${publicId}`);

      const deletionResponse = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (deletionResponse.result === "ok") {
        deletedItems.push({ publicId, resourceType });
      } else {
        console.warn(
          `⚠️ Failed to delete (${publicId}): ${deletionResponse.result}`
        );
      }
    } catch (error) {
      console.error(
        `🚨 Error deleting image: ${publicId}, Error: ${error.message}`
      );
    }
  }

  return deletedItems;
};

// Function to extract Cloudinary Public ID from URL
const getPublicIdFromCloudinaryUrl = (url) => {
  console.log("🔍 Extracting Cloudinary Public ID:", url);

  if (Array.isArray(url)) {
    return url.map((singleUrl) => extractPublicId(singleUrl));
  }

  return extractPublicId(url);
};

// Helper function to extract public ID
const extractPublicId = (url) => {
  const segments = url.split("/");
  const lastTwoSegments = segments.slice(-2).join("/");
  return lastTwoSegments.replace(/\.[^/.]+$/, ""); // Remove file extension
};

module.exports = {
  uploadImageToCloudinary,
  deleteImageToCloudinary,
  getPublicIdFromCloudinaryUrl,
};
