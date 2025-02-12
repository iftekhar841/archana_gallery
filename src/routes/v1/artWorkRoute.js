const express = require("express");
const artWorkController = require("../../controllers/artWorkController");
const {
  verifyJWT,
  optionalVerifyJWT,
} = require("../../middleware/authMiddleware");

const artWorkRoute = express.Router();

artWorkRoute.post("/add-artWork", verifyJWT, artWorkController.addArtWork);

artWorkRoute.put(
  "/edit-artwork/:artworkId",
  verifyJWT,
  artWorkController.updateArtWork
);

artWorkRoute.delete(
  "/delete-artwork/:artworkId",
  verifyJWT,
  artWorkController.deleteArtworkById
);

// Get all artworks by a specific artist
artWorkRoute.get("/artist/:artistId", artWorkController.getArtworksByArtistId);

artWorkRoute.get(
  "/get-artWorks",
  optionalVerifyJWT,
  artWorkController.getArtWorks
);

module.exports = artWorkRoute;
