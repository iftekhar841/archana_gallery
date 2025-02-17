const artistService = require("../services/artistService");
const asyncHandler = require("../utils/asyncHandler");
const moment = require("moment");
const mongoose = require("mongoose");
const { uploadImageToCloudinary } = require("../utils/cloudinary");

const addArtist = asyncHandler(async (req, res) => {
  try {
    let artistFiles = req.files?.artistImage; // Get uploaded image(s)
    console.log(
      "Received Image(s):",
      artistFiles
        ? artistFiles.name || "Multiple files uploaded"
        : "No image uploaded"
    );

    const {
      artistEmail,
      firstName,
      lastName,
      presentAddress,
      description,
      dateOfBirth,
    } = req.body;

    if (
      !artistEmail ||
      !firstName ||
      !lastName ||
      !presentAddress ||
      !description ||
      !dateOfBirth
    ) {
      return res
        .status(400)
        .json({ success: false, message: "required feilds are missing" });
    }

    // Fetch logged user
    const loggedInUser = req.user;

    if (!loggedInUser || loggedInUser.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can add artists.",
      });
    }

    // Check and parse date format
    let formattedDOB;
    if (moment(dateOfBirth, "YYYY-MM-DD", true).isValid()) {
      formattedDOB = moment(dateOfBirth, "YYYY-MM-DD").toDate();
    } else if (moment(dateOfBirth, "DD MMMM YYYY", true).isValid()) {
      formattedDOB = moment(dateOfBirth, "DD MMMM YYYY").toDate();
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use 'YYYY-MM-DD' or 'DD MMMM YYYY'",
      });
    }

    // Validate artwork files
    if (!artistFiles) {
      return res.status(400).json({
        success: false,
        message: "Artist image(s) required. Please upload one or more artist.",
      });
    }

    // Ensure artistFiles is an array (for multiple uploads)
    if (!Array.isArray(artistFiles)) {
      artistFiles = [artistFiles]; // Convert single file object into an array
    }

    // Upload each image to Cloudinary (inside 'artworks' folder)
    console.log("Uploading images to Cloudinary...");
    const uploadedImageUrls = await Promise.all(
      artistFiles.map((file) => uploadImageToCloudinary(file, "artists"))
    );

    const artistResponse = await artistService.addArtist({
      artistEmail,
      firstName,
      lastName,
      artistImage: uploadedImageUrls, //Array of image URLs
      presentAddress,
      description,
      dateOfBirth: formattedDOB,
    });
    return res.status(201).json({
      success: true,
      message: "Artist Adding Successfully.",
      artist: artistResponse,
    });
  } catch (error) {
    console.error("Adding artist error !", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Adding artist failed !",
    });
  }
});

const updateArtist = asyncHandler(async (req, res) => {
  try {
    // Fetch logged-in user
    const loggedInUser = req.user;
    console.log("logeed", loggedInUser);

    // Check if user is an admin
    if (!loggedInUser || loggedInUser.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can update artists.",
      });
    }

    const { artistId } = req.params;
    // Validate artist Id
    if (!artistId) {
      return res
        .status(400)
        .json({ success: false, message: "Artist ID is required." });
    }

    // Check if artistId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Artist ID format.",
      });
    }

    // Validate request body
    if (!req.body || !Object.keys(req.body).length) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update.",
      });
    }

    // Call service to update artist
    const updatedArtist = await artistService.updateArtist(artistId, req.body);

    return res.status(200).json({
      success: true,
      message: "Artist updated successfully.",
      artist: updatedArtist,
    });
  } catch (error) {
    console.error("Error updating artist:", error);

    // Handle Mongoose CastError (e.g., invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Artist ID format.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Updating artist failed!",
    });
  }
});

const deleteArtistById = asyncHandler(async (req, res) => {
  try {
    // Fetch logged-in user
    const loggedInUser = req.user;
    console.log("logeed", loggedInUser);

    // Check if user is an admin
    if (!loggedInUser || loggedInUser.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can delete artists.",
      });
    }

    // Check if artistId is a valid MongoDB ObjectId
    if (!artistId || !mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artist ID format.",
      });
    }

    // Call service to delete artist
    const deletedArtist = await artistService.deleteArtistById(artistId);

    return res.status(200).json({
      success: true,
      message: "Artist deleted successfully.",
      artist: deletedArtist,
    });
  } catch (error) {
    console.error("Error Deleting artist:", error);

    // Handle Mongoose CastError (e.g., invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Artist ID format.",
      });
    }

    if (error.message.includes("does not exist")) {
      return res.status(404).json({
        success: false,
        message: "Artist does not exist or has already been deleted.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Deleting artist failed!",
    });
  }
});

const getSingleArtistById = asyncHandler(async (req, res) => {
  try {
    // Fetch logged user (if any)
    const isAuthenticated = req.user;
    console.log("🚀 ~ getArtWorks ~ isAuthenticated:", isAuthenticated);

    const { artistId } = req.params;
    // Check if artistId is a valid MongoDB ObjectId
    if (!artistId || !mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artist ID format.",
      });
    }
    // Call service to view artist
    const artistDetails = await artistService.getSingleArtistById(
      artistId,
      isAuthenticated
    );

    return res.status(200).json({
      success: true,
      message: "Artist fetch successfully.",
      artist: artistDetails,
    });
  } catch (error) {
    console.error("Error Deleting artist:", error);

    // Handle Mongoose CastError (e.g., invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Artist ID format.",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Deleting artist failed!",
    });
  }
});

const getAllArtists = asyncHandler(async (req, res) => {
  try {
    const artistResponse = await artistService.getAllArtists();
    return res.status(201).json({
      success: true,
      message: "Artist Fetching Successfully.",
      artists: artistResponse,
    });
  } catch (error) {
    console.error("Fetching artist error !", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Fetching artist failed !",
    });
  }
});

module.exports = {
  addArtist,
  updateArtist,
  deleteArtistById,
  getSingleArtistById,
  getAllArtists,
};
