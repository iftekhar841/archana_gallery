const mongoose = require("mongoose");

const artWorkSchema = new mongoose.Schema(
  {
    artWorkImage: {
      type: String,
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
      validate: {
        validator: function (value) {
          // Allow values like "$200-500" or a single price like "$400"
          return /^\$\d{3}-\d{3}$/.test(value) || /^\$\d{3}$/.test(value);
        },
        message: "Price should be in format '$200-500' or '$400'",
      },
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
