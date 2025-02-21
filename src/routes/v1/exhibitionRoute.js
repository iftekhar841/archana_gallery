const express = require("express");
const exhibitionController = require("../../controllers/exhibitionController");
const {
  verifyJWT,
  optionalVerifyJWT,
} = require("../../middleware/authMiddleware");

const exhibitionRoute = express.Router();

exhibitionRoute.post("/add", verifyJWT, exhibitionController.createExhibition);

exhibitionRoute.put(
  "/update/:id",
  verifyJWT,
  exhibitionController.updateExhibition
);

exhibitionRoute.delete(
  "/delete/:id",
  verifyJWT,
  exhibitionController.deleteExhibition
);

exhibitionRoute.get(
  "/single-exhibition/:id",
  exhibitionController.getExhibitionById
);

exhibitionRoute.get("/get-exhibition", exhibitionController.getExhibition);

module.exports = exhibitionRoute;
