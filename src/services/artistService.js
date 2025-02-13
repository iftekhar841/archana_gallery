const Artist = require("../models/artistSchema");
const { validateEmail } = require("../helpers/helperFunction.js");

const addArtist = async (artistDetails) => {
  const {
    artistEmail,
    firstName,
    lastName,
    artistImage,
    presentAddress,
    description,
    dateOfBirth,
  } = artistDetails;

  // Check if artist already exists (Prevent Duplicates)
  const existingArtist = await Artist.findOne({ artistEmail }).select(
    "artistEmail"
  );

  if (existingArtist) {
    throw new Error("Artist with the same email already exists.");
  }

  const validatedEmail = await validateEmail(artistEmail);

  const artistDataToSave = await Artist.create({
    artistEmail: validatedEmail,
    firstName,
    lastName,
    artistImage,
    presentAddress,
    description,
    dateOfBirth,
  });

  if (!artistDataToSave) {
    throw new Error("Something went wrong while registering the user");
  }

  return artistDataToSave;
};

const updateArtist = async (artistId, updateFields) => {
  // Find artist by ID
  const existingArtist = await Artist.findById(artistId);

  if (!existingArtist) {
    throw new Error("Artist does not exist.");
  }

  // Update artist details
  const updatedArtist = await Artist.findByIdAndUpdate(
    artistId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedArtist) {
    throw new Error("Failed to update the artist, please try again.");
  }

  return updatedArtist;
};

const deleteArtistById = async (artistId) => {
  // Directly delete the artist and check if it exists in one query
  const deletedArtist = await Artist.findByIdAndDelete(artistId);

  if (!deletedArtist) {
    throw new Error("Artist does not exist or has already been deleted.");
  }

  return deletedArtist;
};

const getSingleArtistById = async (artistId) => {
  // Directly delete the artist and check if it exists in one query
  const singleArtist = await Artist.findById(artistId);

  if (!singleArtist) {
    throw new Error("Artist does not exist or has already been deleted.");
  }

  return singleArtist;
};

const getAllArtists = async () => {
  const allArtistToFetch = await Artist.find();

  if (!allArtistToFetch || allArtistToFetch.length === 0) {
    throw new Error("No artist record found");
  }

  return allArtistToFetch;
};

module.exports = {
  addArtist,
  updateArtist,
  deleteArtistById,
  getSingleArtistById,
  getAllArtists,
};
