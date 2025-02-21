const exhibitionService = require("../services/exhibitionService");
const artistService = require("../services/artistService");
const artWorkService = require("../services/artWorkService");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const moment = require("moment");

const createExhibition = asyncHandler(async (req, res) => {
  try {
    const {
      artistId,
      artWorkId,
      exhibitionStartDate,
      exhibitionEndDate,
      description,
    } = req.body;

    // Validate required fields
    if (
      !artistId ||
      !artWorkId ||
      !exhibitionStartDate ||
      !exhibitionEndDate ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: artistId, artWorkId, exhibitionStartDate, exhibitionEndDate, description.",
      });
    }

    // Check if artistId is valid
    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artist ID format.",
      });
    }

    // Check if artWorkId is valid
    if (!mongoose.Types.ObjectId.isValid(artWorkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artwork ID format.",
      });
    }

    const formats = ["YYYY-MM-DD", "DD-MM-YYYY"];

    // Validate date format and check start < end
    const startMoment = moment.utc(exhibitionStartDate, formats, true);
    const endMoment = moment.utc(exhibitionEndDate, formats, true);

    if (!startMoment.isValid() || !endMoment.isValid()) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Please use 'YYYY-MM-DD' or 'DD-MM-YYYY'.",
      });
    }

    if (endMoment.isBefore(startMoment)) {
      return res.status(400).json({
        success: false,
        message: "Exhibition end date cannot be before start date.",
      });
    }

    // Check if the artist exists
    await artistService.getSingleArtistById(artistId);

    // Check if the user is an admin
    const isAuthenticated = req.user;
    if (!isAuthenticated || isAuthenticated.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access! Only admins can add exhibition.",
      });
    }

    // Convert to Date objects for storage
    const startDate = startMoment.toDate();
    const endDate = endMoment.toDate();

    // Prepare data for service
    const exhibitionData = {
      artistId,
      artWorkId,
      startDate,
      endDate,
      description,
    };

    const exhibitionResponse = await exhibitionService.createExhibition(
      exhibitionData
    );

    return res.status(201).json({
      success: true,
      message: "Exhibition added successfully",
      exhibition: exhibitionResponse,
    });
  } catch (error) {
    console.error("Exhibiton Error failed", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while adding exhibiton. Please try again.",
    });
  }
});

const updateExhibition = asyncHandler(async (req, res) => {
  try {
    const { id: exhibitionId } = req.params;
    console.log("🚀 ~ updateExhibition ~ exhibitionId:", exhibitionId);

    // Check if exhibitionId is valid
    if (!mongoose.Types.ObjectId.isValid(exhibitionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Exhibition ID format.",
      });
    }

    // ✅ Validate request body (at least one field required)
    const updateFields = req.body;
    console.log("🚀 ~ updateExhibition ~ updateFields:", updateFields);
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
        message: "Invalid or missing Artist ID format.",
      });
    }

    // ✅ Validate artWork ID format (if provided)
    if (
      updateFields.artWork &&
      !mongoose.Types.ObjectId.isValid(updateFields.artWork)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Artwork ID format.",
      });
    }

    // If date fields are provided in the update, handle them similar to createExhibition.
    const formats = ["YYYY-MM-DD", "DD-MM-YYYY"];
    if (updateFields.startDate || updateFields.endDate) {
      // Ensure both date fields are provided
      if (!updateFields.startDate || !updateFields.endDate) {
        return res.status(400).json({
          success: false,
          message: "Both startDate and endDate are required for date update.",
        });
      }
      const startMoment = moment.utc(updateFields.startDate, formats, true);
      const endMoment = moment.utc(updateFields.endDate, formats, true);

      console.log("startMoment", startMoment, "endMoment", endMoment);

      if (!startMoment.isValid() || !endMoment.isValid()) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid date format. Please use 'YYYY-MM-DD' or 'DD-MM-YYYY'.",
        });
      }

      if (endMoment.isBefore(startMoment)) {
        return res.status(400).json({
          success: false,
          message: "Exhibition end date cannot be before start date.",
        });
      }

      // Convert to Date objects for storage and add to updateFields.
      updateFields.startDate = startMoment.toDate();
      updateFields.endDate = endMoment.toDate();
    }

    // ✅ Check if artist exists (Service already handles error)
    if (updateFields.artist) {
      const artist = await artistService.getSingleArtistById(
        updateFields.artist
      );
      console.log("🚀 ~ updateExhibition ~ artist:", artist);
    }

    // Check if the user is an admin
    const isAuthenticated = req.user;
    if (!isAuthenticated || isAuthenticated.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access! Only admins can add exhibition.",
      });
    }

    const exhibitionResponse = await exhibitionService.updateExhibition(
      exhibitionId,
      updateFields
    );
    console.log(
      "🚀 ~ updateExhibition ~ exhibitionResponse:",
      exhibitionResponse
    );

    return res.status(200).json({
      success: true,
      message: "Exhibition update successfully",
      exhibition: exhibitionResponse,
    });
  } catch (error) {
    console.error("Exhibiton Error failed", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while updating exhibiton. Please try again.",
    });
  }
});

const deleteExhibition = asyncHandler(async (req, res) => {
  try {
    const { id: exhibitionId } = req.params;
    // Check if exhibitionId is valid
    if (!mongoose.Types.ObjectId.isValid(exhibitionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Exhibition ID format.",
      });
    }

    // Check if the user is an admin
    const isAuthenticated = req.user;
    if (!isAuthenticated || isAuthenticated.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access! Only admins can delete exhibition.",
      });
    }

    const exhibitionResponse = await exhibitionService.deleteExhibition(
      exhibitionId
    );

    return res.status(200).json({
      success: true,
      message: "Exhibition deleting successfully",
      exhibition: exhibitionResponse,
    });
  } catch (error) {
    console.error("Exhibiton Error failed", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while deleting exhibiton. Please try again.",
    });
  }
});

const getExhibitionById = asyncHandler(async (req, res) => {
  try {
    const { id: exhibitionId } = req.params;
    // Check if exhibitionId is valid
    if (!mongoose.Types.ObjectId.isValid(exhibitionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Exhibition ID format.",
      });
    }

    const exhibitionResponse = await exhibitionService.getExhibitionById(
      exhibitionId
    );

    return res.status(200).json({
      success: true,
      message: "Exhibition fetching successfully",
      exhibition: exhibitionResponse,
    });
  } catch (error) {
    console.error("Exhibiton Error failed", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while fetching exhibiton. Please try again.",
    });
  }
});

const getExhibition = asyncHandler(async (req, res) => {
  try {
    const exhibitionResponse = await exhibitionService.getExhibition();

    return res.status(200).json({
      success: true,
      message: "Exhibition fetching successfully.",
      exhibition: exhibitionResponse,
    });
  } catch (error) {
    console.error("Exhibition Error failed".error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while fetching exhibiton. Please try again.",
    });
  }
});

module.exports = {
  createExhibition,
  updateExhibition,
  deleteExhibition,
  getExhibitionById,
  getExhibition,
};
