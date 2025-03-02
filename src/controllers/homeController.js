const homeService = require("../services/homeService");
const asyncHandler = require("../utils/asyncHandler");
const {
  uploadImageToCloudinary,
  getPublicIdFromCloudinaryUrl,
  deleteImageToCloudinary,
} = require("../utils/cloudinary");
const mongoose = require("mongoose");

const addBanner = asyncHandler(async (req, res) => {
  try {
    let bannerFiles = req.files?.bannerImage;
    console.log("🚀 ~ addBanner ~ files:", bannerFiles);
    console.log(
      "Received Image(s):",
      bannerFiles
        ? bannerFiles.name || "Multiple files uploaded"
        : "No image uploaded"
    );

    // Check if the user is an admin
    const isAuthenticated = req.user;
    if (!isAuthenticated || isAuthenticated.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access! Only admins can add banner.",
      });
    }

    // Validate banner files
    if (!bannerFiles) {
      return res.status(400).json({
        success: false,
        message: "Banner image(s) required. Please upload one or more banner.",
      });
    }

    // Ensure bannerFiles is an array (for multiple uploads)
    if (!Array.isArray(bannerFiles)) {
      bannerFiles = [bannerFiles]; // Convert single file object into an array
    }

    // Upload each image to Cloudinary (inside 'banner' folder)
    console.log("Uploading images to Cloudinary...");
    const uploadedImageUrls = await Promise.all(
      bannerFiles.map((file) => uploadImageToCloudinary(file, "banners"))
    );

    const { title } = req.body;

    const bannerResponnse = await homeService.addBanner({
      bannerImage: uploadedImageUrls,
      title,
    });
    return res.status(201).json({
      success: true,
      message: "Banner is created successfully",
      banner: bannerResponnse,
    });
  } catch (error) {
    console.error("Adding the banner failed !", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const updateBanner = asyncHandler(async (req, res) => {
  try {
    // ✅ Fetch logged-in user
    const isAuthenticated = req.user;
    console.log("Logged in User:", isAuthenticated);

    // ✅ Check if user is an admin
    if (!isAuthenticated || isAuthenticated.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can update banner.",
      });
    }

    // ✅ Extract and validate banner ID
    const { bannerId } = req.params;
    if (!bannerId || !mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Banner ID.",
      });
    }

    // ✅ Validate request body (at least one field required)
    const updateFields = req.body;
    if (!updateFields || Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update.",
      });
    }

    // ✅ Handle banner image update
    let bannerFiles = req.files?.bannerImage;
    if (bannerFiles) {
      // Ensure bannerFiles is an array
      if (!Array.isArray(bannerFiles)) {
        bannerFiles = [bannerFiles];
      }

      // Fetch existing banner details
      const existingBanner = await homeService.getSingleBannerById(bannerId);
      // Extract and delete existing images from Cloudinary
      const publicIds = getPublicIdFromCloudinaryUrl(
        existingBanner.bannerImage
      );
      await deleteImageToCloudinary(
        Array.isArray(publicIds) ? publicIds : [publicIds]
      );

      // Upload new images to Cloudinary
      console.log("Uploading new images to Cloudinary...");
      const uploadedImageUrls = await Promise.all(
        bannerFiles.map((file) => uploadImageToCloudinary(file, "banners"))
      );

      // Update banner images in the request body
      updateFields.bannerImage = uploadedImageUrls;
    }

    // ✅ Call service to update banner
    const updatedBanner = await homeService.updateBanner(
      bannerId,
      updateFields
    );

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully.",
      banner: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Updating banner failed!",
    });
  }
});

const deleteBannerById = asyncHandler(async (req, res) => {
  try {
    // Fetch logged-in user
    const isAuthenticated = req.user;

    // Check if user is an admin
    if (!isAuthenticated || isAuthenticated.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can delete banner.",
      });
    }

    // ✅ Extract and validate banner ID
    const { bannerId } = req.params;
    if (!bannerId || !mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Banner ID.",
      });
    }

    const bannerFetch = await homeService.getSingleBannerById(bannerId);

    // Extract public ID and delete image from Cloudinary
    const publicIds = getPublicIdFromCloudinaryUrl(bannerFetch.bannerImage);
    await deleteImageToCloudinary(
      Array.isArray(publicIds) ? publicIds : [publicIds]
    );

    // Call service to delete banner
    const deletedBanner = await homeService.deleteBannerById(bannerId);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully.",
      banner: deletedBanner,
    });
  } catch (error) {
    console.error("Error Deleting banner:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Deleting banner failed!",
    });
  }
});

const getAllBanners = asyncHandler(async (req, res) => {
  try {
    const bannerResponse = await homeService.getAllBanners();
    return res.status(200).json({
      success: true,
      message: "Banner Fetching Successfully.",
      banners: bannerResponse,
    });
  } catch (error) {
    console.error("Fetching banner error !", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Fetching banner failed !",
    });
  }
});

module.exports = {
  addBanner,
  updateBanner,
  deleteBannerById,
  getAllBanners,
};
