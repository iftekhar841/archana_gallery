const ArtWork = require("../models/artWorkSchema");

const addArtWork = async (artWorkDetails) => {
  const { artWorkImage, artist, priceRange, description } = artWorkDetails;

  const newArtWork = await ArtWork.create({
    artWorkImage,
    artist,
    priceRange,
    description,
  });

  if (!newArtWork) {
    throw new Error("Something went wrong while adding the art work");
  }

  // ✅ Populate only selected artist fields
  const populatedArtWork = await newArtWork.populate(
    "artist",
    "firstName lastName artistEmail"
  );

  return populatedArtWork;
};

const updateArtWork = async (artworkId, updateFields) => {
  // Find artwork by ID
  const existingArtist = await ArtWork.findById(artworkId);

  if (!existingArtist) {
    throw new Error("Artist does not exist.");
  }

  // Update artworks details
  const updatedArtist = await ArtWork.findByIdAndUpdate(
    artworkId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedArtist) {
    throw new Error("Failed to update the artist, please try again.");
  }

  return updatedArtist;
};

const getArtWorks = async () => {
  const allArtworkToFetch = await ArtWork.find().populate("artist");

  if (!allArtworkToFetch || allArtworkToFetch.length === 0) {
    throw new Error("No artwork record found");
  }

  return allArtworkToFetch;
};

const deleteArtworkById = async (artworkId) => {
  // Directly delete the artwork and check if it exists in one query
  const deletedArtist = await ArtWork.findByIdAndDelete(artworkId);

  if (!deletedArtist) {
    throw new Error("Artwork does not exist or has already been deleted.");
  }

  return deletedArtist;
};

module.exports = {
  addArtWork,
  updateArtWork,
  getArtWorks,
  deleteArtworkById,
};
