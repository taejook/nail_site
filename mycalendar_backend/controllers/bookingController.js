const Booking = require("../models/booking");

// Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { service, staffMember, start, end } = req.body;

    // User info comes from JWT
    const booking = await Booking.create({
      user: req.user.id,
      service,
      staffMember,
      start,
      end,
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// Get all bookings (admin or staff use case)
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate("user", "fullName email");
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// Get current user’s bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking canceled" });
  } catch (err) {
    next(err);
  }
};
