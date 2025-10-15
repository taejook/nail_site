const express = require("express");
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/", auth, getAllBookings);      
router.get("/me", auth, getMyBookings);
router.delete("/:id", auth, cancelBooking);

module.exports = router;
