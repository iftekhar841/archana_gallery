const Home = require("../models/homeSchema");

const addBanner = async (bannerDetails) => {
  const { title, bannerImage } = bannerDetails;

  const newBanner = await Home.create({
    title,
    bannerImage,
  });

  if (!newBanner) {
    throw new Error("Something went wrong while adding the banner");
  }

  return newBanner;
};

const updateBanner = async (bannerId, updateFields) => {
  // Find banner by ID
  const existingBanner = await Home.findById(bannerId);

  if (!existingBanner) {
    throw new Error("Banner does not exist.");
  }

  // Update artworks details
  const updatedBanner = await Home.findByIdAndUpdate(
    bannerId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedBanner) {
    throw new Error("Failed to update the banner, please try again.");
  }

  return updatedBanner;
};

const getSingleBannerById = async (bannerId) => {
  const banner = await Home.findById(bannerId);

  if (!banner) {
    throw new Error("Banner does not exist or has already been deleted.");
  }

  return banner;
};

const deleteBannerById = async (bannerId) => {
  // Directly delete the artwork and check if it exists in one query
  const deletedBanner = await Home.findByIdAndDelete(bannerId);

  if (!deletedBanner) {
    throw new Error("Banner does not exist or has already been deleted.");
  }

  const fetchAllBanner = await Home.find();

  if (!fetchAllBanner || fetchAllBanner.length === 0) {
    throw new Error("No banner record found.");
  }

  return fetchAllBanner;
};

const getAllBanners = async () => {
  const allBannerToFetch = await Home.find();

  if (!allBannerToFetch || allBannerToFetch.length === 0) {
    throw new Error("No banner record found");
  }

  return allBannerToFetch;
};

module.exports = {
  addBanner,
  updateBanner,
  getSingleBannerById,
  deleteBannerById,
  getAllBanners,
};
