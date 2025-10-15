const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: String, required: true },
  staffMember: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

module.exports = mongoose.model("Booking", bookingSchema);
