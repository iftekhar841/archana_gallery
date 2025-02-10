const express = require("express");
const artWorkController = require("../../controllers/artWorkController");
const verifyJWT = require("../../middleware/authMiddleware");

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

// artWorkRoute.get(
//   "/get-singleArtist/:artistId",
//   verifyJWT,
//   artistController.getSingleArtistById
// );

artWorkRoute.get("/get-artWorks", verifyJWT, artWorkController.getArtWorks);

module.exports = artWorkRoute;
