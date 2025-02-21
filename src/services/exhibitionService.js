const Exhibition = require("../models/exhibitionSchema");
const ArtWork = require("../models/artWorkSchema");

const createExhibition = async (exhibitionData) => {
  const { artistId, artWorkId, startDate, endDate, description } =
    exhibitionData;

  console.log("🚀 ~ createExhibition ~ exhibitionData:", exhibitionData);

  // Verify that the artwork belongs to the specified artist
  const existingArtwork = await ArtWork.findOne({
    _id: artWorkId,
    artist: artistId,
  });

  if (!existingArtwork) {
    throw new Error("Artwork does not belong to this artist or doesn't exist.");
  }

  // Create the exhibition record
  const newExhibition = await Exhibition.create({
    artist: artistId,
    artWork: artWorkId,
    startDate,
    endDate,
    description,
  });

  if (!newExhibition) {
    throw new Error("Something went wrong while adding the exhibition.");
  }

  return newExhibition;
};

const updateExhibition = async (exhibitionId, updateFields) => {
  console.log("🚀 ~ updateExhibition ~ updateFields:", updateFields);

  const exhibition = await Exhibition.findById(exhibitionId);
  console.log("exhibition--->", exhibition);

  if (!exhibition) {
    throw new Error("Exhibiton does not exist or has already been deleted.");
  }

  // If both artWork and artist are provided in the update, verify that the artwork belongs to the specified artist.
  if (updateFields.artWork && updateFields.artist) {
    const existingArtwork = await ArtWork.findOne({
      _id: updateFields.artWork,
      artist: updateFields.artist,
    });

    if (!existingArtwork) {
      throw new Error(
        "The specified artwork does not belong to the provided artist or doesn't exist."
      );
    }
  }

  // Optionally, if only artwork is updated (and artist is not provided),
  // you might want to check if the existing exhibition.artist matches the artwork's artist.
  else if (updateFields.artWork && !updateFields.artist) {
    const existingArtwork = await ArtWork.findById(updateFields.artWork);
    if (!existingArtwork) {
      throw new Error("The specified artwork doesn't exist.");
    }
    if (existingArtwork.artist.toString() !== exhibition.artist.toString()) {
      throw new Error(
        "The specified artwork does not belong to the exhibition's artist."
      );
    }
  }

  // Update exhibition details
  const updateExhibition = await Exhibition.findByIdAndUpdate(
    exhibitionId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updateExhibition) {
    throw new Error("Failed to update the exhibition, please try again.");
  }

  return updateExhibition;
};

const deleteExhibition = async (exhibitionId) => {
  // Directly delete the exhibition and check if it exists in one query
  const deletedExhibition = await Exhibition.findByIdAndDelete(exhibitionId);

  if (!deletedExhibition) {
    throw new Error("Exhibition does not exist or has already been deleted.");
  }

  const fetchAllExhibition = await Exhibition.find().populate("artWork");

  if (!fetchAllExhibition || fetchAllExhibition.length === 0) {
    throw new Error("No artwork record found.");
  }

  return fetchAllExhibition;
};

const getExhibition = async () => {
  const allExhibition = await Exhibition.find().populate("artWork");

  if (!allExhibition || allExhibition.length === 0) {
    throw new Error("No record found of this exhibition ");
  }

  return allExhibition;
};

const getExhibitionById = async (exhibitionId) => {
  const exhibition = await Exhibition.findById(exhibitionId).populate(
    "artWork"
  );
  console.log("🚀 ~ getExhibitionById ~ exhibition:", exhibition);

  if (!exhibition) {
    throw new Error("Exhibition does not exist or has already been deleted.");
  }

  return exhibition;
};

module.exports = {
  createExhibition,
  updateExhibition,
  deleteExhibition,
  getExhibitionById,
  getExhibition,
};
