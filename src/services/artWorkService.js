const ArtWork = require("../models/artWorkSchema");

const addArtWork = async (artWorkDetails) => {
  const { artWorkName, artWorkImage, artist, priceRange, description } =
    artWorkDetails;

  const newArtWork = await ArtWork.create({
    artWorkName,
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
  const existingArtwork = await ArtWork.findById(artworkId);

  if (!existingArtwork) {
    throw new Error("Artwork does not exist.");
  }

  // Update artworks details
  const updatedArtwork = await ArtWork.findByIdAndUpdate(
    artworkId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedArtwork) {
    throw new Error("Failed to update the artwork, please try again.");
  }

  return updatedArtwork;
};

const getArtWorks = async () => {
  const allArtworkToFetch = await ArtWork.find().populate("artist");

  if (!allArtworkToFetch || allArtworkToFetch.length === 0) {
    throw new Error("No artwork record found");
  }

  return allArtworkToFetch;
};

const limitedArtWork = async () => {
  const allArtworkToFetch = await ArtWork.find().populate(
    "artist",
    "firstName lastName description"
  );

  if (!allArtworkToFetch || allArtworkToFetch.length === 0) {
    throw new Error("No artwork record found");
  }

  return allArtworkToFetch;
};

const deleteArtworkById = async (artworkId) => {
  // Directly delete the artwork and check if it exists in one query
  const deletedArtwork = await ArtWork.findByIdAndDelete(artworkId);

  if (!deletedArtwork) {
    throw new Error("Artwork does not exist or has already been deleted.");
  }

  return deletedArtwork;
};

const getSingleArtworkById = async (artworkId) => {
  const artwork = await ArtWork.findById(artworkId);

  if (!artwork) {
    throw new Error("Artwork does not exist or has already been deleted.");
  }

  return artwork;
};

const getArtworksByArtistId = async (artistId) => {
  const allArtworks = await ArtWork.find({ artist: artistId }).select(
    "artWorkImage artist"
  );

  console.log("🚀 ~ getArtworksByArtistId ~ allArtworks:", allArtworks);

  if (!allArtworks || allArtworks.length === 0) {
    throw new Error("No artwork record found of the artist");
  }

  return allArtworks;
};

module.exports = {
  addArtWork,
  updateArtWork,
  getArtWorks,
  limitedArtWork,
  deleteArtworkById,
  getSingleArtworkById,
  getArtworksByArtistId,
};
