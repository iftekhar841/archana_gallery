const Artist = require("../models/artistSchema");
const { validateEmail } = require("../helpers/helperFunction.js");

const addArtist = async (artistDetails) => {
  const {
    artistEmail,
    firstName,
    lastName,
    artistImage,
    description,
    presentAddress,
    dateOfBirth,
  } = artistDetails;

  const validatedEmail = await validateEmail(artistEmail);

  const artistDataToSave = await Artist.create({
    artistEmail: validatedEmail,
    firstName,
    lastName,
    artistImage,
    description,
    presentAddress,
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

const getSingleArtistById = async (artistId, isAuthenticated) => {
  // Fetch the artist by ID
  const singleArtist = await Artist.findById(artistId);

  if (!singleArtist) {
    throw new Error("Artist does not exist or has already been deleted.");
  }

  // If a user is authenticated and is an admin, return full details.
  // Otherwise, return the artist details with the email hidden.
  if (isAuthenticated && isAuthenticated.role === process.env.IS_ADMIN) {
    return singleArtist;
  } else {
    const { artistEmail, ...artistDataWithoutEmail } = singleArtist.toObject();
    return artistDataWithoutEmail;
  }
};

const getAllArtists = async () => {
  const allArtistToFetch = await Artist.find();

  if (!allArtistToFetch || allArtistToFetch.length === 0) {
    throw new Error("No artist record found");
  }

  return allArtistToFetch;
};

/**
 * Fetch artist by email (to be used in the controller before uploading images)
 */
const getArtistByEmail = async (artistEmail) => {
  return await Artist.findOne({ artistEmail }).select("artistEmail");
};

module.exports = {
  addArtist,
  updateArtist,
  deleteArtistById,
  getSingleArtistById,
  getAllArtists,
  getArtistByEmail,
};
