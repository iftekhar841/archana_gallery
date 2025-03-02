const artWorkService = require("../services/artWorkService");
const artistService = require("../services/artistService");
const asyncHandler = require("../utils/asyncHandler");
const {
  uploadImageToCloudinary,
  getPublicIdFromCloudinaryUrl,
  deleteImageToCloudinary,
} = require("../utils/cloudinary");

const mongoose = require("mongoose");

const addArtWork = asyncHandler(async (req, res) => {
  try {
    let artworkFiles = req.files?.artWorkImage; // Get uploaded image(s)
    console.log(
      "Received Image(s):",
      artworkFiles ? artworkFiles.name : "No image uploaded"
    );

    const { artist, priceRange, description, artWorkName } = req.body;

    // Validate required text fields
    if (!artist || !priceRange || !description || !artWorkName) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: artWorkName, artist, priceRange, and description.",
      });
    }

    // Check if artistId is a valid MongoDB ObjectId
    if (!artist || !mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artist ID format.",
      });
    }

    // ✅ Check if artist exists in the database
    const checkIsArtistExist = await artistService.getSingleArtistById(artist);

    // Check if the user is an admin
    const loggedInUser = req.user;
    if (!loggedInUser || loggedInUser.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access! Only admins can add artwork.",
      });
    }

    // Validate artwork files
    if (!artworkFiles) {
      return res.status(400).json({
        success: false,
        message: "Artwork image(s) required. Please upload an artwork.",
      });
    }

    // // Ensure artworkFiles is an array (for multiple uploads)
    // if (!Array.isArray(artworkFiles)) {
    //   artworkFiles = [artworkFiles]; // Convert single file object into an array
    // }

    // ✅ If multiple files are uploaded, reject the request
    if (Array.isArray(artworkFiles)) {
      return res.status(400).json({
        success: false,
        message: "Only one artwork image is allowed.",
      });
    }

    // // Upload each image to Cloudinary (inside 'artworks' folder)
    // console.log("Uploading images to Cloudinary...");
    // const uploadedImageUrls = await Promise.all(
    //   artworkFiles.map((file) => uploadImageToCloudinary(file, "artworks"))
    // );

    // ✅ Upload single image to Cloudinary
    console.log("Uploading image to Cloudinary...");
    const uploadedImageUrl = await uploadImageToCloudinary(
      artworkFiles,
      "artworks"
    );

    // Save artwork details to the database
    const newArtwork = await artWorkService.addArtWork({
      artWorkName,
      artWorkImage: uploadedImageUrl,
      artist: checkIsArtistExist,
      priceRange,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Artwork(s) added successfully.",
      artWork: newArtwork,
    });
  } catch (error) {
    console.error("Error Adding Artwork:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while adding artwork. Please try again.",
    });
  }
});

const updateArtWork = asyncHandler(async (req, res) => {
  try {
    // ✅ Fetch logged-in user
    const loggedInUser = req.user;
    console.log("Logged in User:", loggedInUser);

    // ✅ Check if user is an admin
    if (!loggedInUser || loggedInUser.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can update artwork.",
      });
    }

    // ✅ Extract and validate artwork ID
    const { artworkId } = req.params;
    if (!artworkId || !mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artwork ID.",
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

    // ✅ Validate artist ID format (if provided)
    if (
      updateFields.artist &&
      !mongoose.Types.ObjectId.isValid(updateFields.artist)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Artist ID format.",
      });
    }

    // ✅ Check if artist exists (Service already handles error)
    if (updateFields.artist) {
      await artistService.getSingleArtistById(updateFields.artist);
    }

    // ✅ Handle artwork image update
    let artworkFiles = req.files?.artWorkImage;
    if (artworkFiles) {
      // Ensure artworkFiles is an array
      if (!Array.isArray(artworkFiles)) {
        artworkFiles = [artworkFiles];
      }

      // Fetch existing artwork details
      const existingArtwork = await artWorkService.getSingleArtworkById(
        artworkId
      );
      // Extract and delete existing images from Cloudinary
      const publicIds = getPublicIdFromCloudinaryUrl(
        existingArtwork.artWorkImage
      );
      await deleteImageToCloudinary(
        Array.isArray(publicIds) ? publicIds : [publicIds]
      );

      // Upload new images to Cloudinary
      console.log("Uploading new images to Cloudinary...");
      const uploadedImageUrls = await Promise.all(
        artworkFiles.map((file) => uploadImageToCloudinary(file, "artworks"))
      );

      // Update artwork images in the request body
      updateFields.artWorkImage = uploadedImageUrls;
    }

    // ✅ Call service to update artwork
    const updatedArtwork = await artWorkService.updateArtWork(
      artworkId,
      updateFields
    );

    return res.status(200).json({
      success: true,
      message: "Artwork updated successfully.",
      artwork: updatedArtwork,
    });
  } catch (error) {
    console.error("Error updating artwork:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Updating artwork failed!",
    });
  }
});

const deleteArtworkById = asyncHandler(async (req, res) => {
  try {
    // Fetch logged-in user
    const loggedInUser = req.user;

    // Check if user is an admin
    if (!loggedInUser || loggedInUser.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can delete artwork.",
      });
    }

    // ✅ Extract and validate artwork ID
    const { artworkId } = req.params;
    if (!artworkId || !mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artwork ID.",
      });
    }

    const artWorkFetch = await artWorkService.getSingleArtworkById(artworkId);

    // Extract public ID and delete image from Cloudinary
    const publicIds = getPublicIdFromCloudinaryUrl(artWorkFetch.artWorkImage);
    await deleteImageToCloudinary(
      Array.isArray(publicIds) ? publicIds : [publicIds]
    );

    // Call service to delete artwork
    const deletedArtwork = await artWorkService.deleteArtworkById(artworkId);

    return res.status(200).json({
      success: true,
      message: "Artwork deleted successfully.",
      artwork: deletedArtwork,
    });
  } catch (error) {
    console.error("Error Deleting artwork:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Deleting artwork failed!",
    });
  }
});

const getArtworksByArtistId = asyncHandler(async (req, res) => {
  try {
    const { artistId } = req.params;
    if (!artistId || !mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artist ID.",
      });
    }

    // Check is artist exists or not
    await artistService.getSingleArtistById(artistId);

    // Call service to delete artwork
    const artWorkResponse = await artWorkService.getArtworksByArtistId(
      artistId
    );
    return res.status(201).json({
      success: true,
      message: "ArtWork Fetching of the artist Successfully.",
      artWorks: artWorkResponse,
    });
  } catch (error) {
    console.error("Fetching artwork error !", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Fetching artwork of the artist failed !",
    });
  }
});

const getArtWorks = asyncHandler(async (req, res) => {
  try {
    // Fetch logged user
    const isAuthenticated = req.user;
    console.log("🚀 ~ getArtWorks ~ isAuthenticated:", isAuthenticated);

    if (isAuthenticated) {
      if (isAuthenticated.role !== process.env.IS_ADMIN) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized! Only admins can view artWork.",
        });
      }

      const artWorkResponse = await artWorkService.getArtWorks();
      return res.status(200).json({
        success: true,
        message: "ArtWork Fetching Successfully.",
        artWorks: artWorkResponse,
      });
    } else {
      const limitedArtWorkResponse = await artWorkService.limitedArtWork();
      return res.status(200).json({
        success: true,
        message: "ArtWork Fetching Successfully.",
        artWorks: limitedArtWorkResponse,
      });
    }
  } catch (error) {
    console.error("Fetching artwork error !", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Fetching artwork failed !",
    });
  }
});

module.exports = {
  addArtWork,
  updateArtWork,
  getArtWorks,
  deleteArtworkById,
  getArtworksByArtistId,
};
