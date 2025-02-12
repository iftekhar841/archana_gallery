const mongoose = require("mongoose");

const artWorkSchema = new mongoose.Schema(
  {
    artWorkName: {
      type: String,
      required: true,
    },
    artWorkImage: {
      type: Array,
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    priceRange: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ArtWork = mongoose.model("ArtWork", artWorkSchema);

module.exports = ArtWork;
