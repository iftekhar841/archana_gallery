const mongoose = require("mongoose");

const exhibitionSchema = new mongoose.Schema(
  {
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    artWork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArtWork",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Exhibition = mongoose.model("Exhibition", exhibitionSchema);

module.exports = Exhibition;
