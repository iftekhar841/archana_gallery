const express = require("express");
const homeController = require("../../controllers/homeController");
const { verifyJWT } = require("../../middleware/authMiddleware");

const homeRoute = express.Router();

homeRoute.post("/add", verifyJWT, homeController.addBanner);

homeRoute.put("/edit-banner/:bannerId", verifyJWT, homeController.updateBanner);

homeRoute.delete(
  "/delete-banner/:bannerId",
  verifyJWT,
  homeController.deleteBannerById
);

homeRoute.get("/get-banners", homeController.getAllBanners);

module.exports = homeRoute;
