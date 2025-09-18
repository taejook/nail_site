// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { DateTime } = require("luxon");

// Import Square SDK
const { SquareClient, SquareEnvironment } = require("square");

function randomId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Sandbox,
});

const app = express();
app.use(cors());
app.use(express.json());

/** ===============================
 * Test endpoint
 * =============================== */
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/** ===============================
 * Locations
 * =============================== */
app.get("/api/locations", async (req, res) => {
  try {
    const response = await client.locations.list();
    res.json(response.locations || []);
  } catch (err) {
    console.error("Locations API error:", err);
    // Fallback: mock locations
    res.json([
      { id: "loc1", name: "Mock Location 1" },
      { id: "loc2", name: "Mock Location 2" },
    ]);
  }
});

/** ===============================
 * Team members
 * =============================== */
app.get("/api/team-members", async (req, res) => {
  try {
    const response = await client.teamMembers.search({});
    if (response.result?.team_members?.length) {
      res.json(response.result);
    } else {
      throw new Error("No team members returned");
    }
  } catch (err) {
    console.error("Team members API error:", err);
    // Fallback: mock team members
    res.json({
      team_members: [
        {
          id: "test1",
          team_member_details: { given_name: "Lucy", family_name: "Oh" },
        },
      ],
    });
  }
});

/** ===============================
 * Services (Catalog)
 * =============================== */
app.get("/api/services", async (req, res) => {
  try {
    const response = await client.catalog.list({ types: ["ITEM"] });
    if (response.objects?.length) {
      res.json(response.objects);
    } else {
      throw new Error("No services returned");
    }
  } catch (err) {
    console.error("Services API error:", err);
    // Fallback: mock services
    res.json([
      { id: "srv1", item_data: { name: "Haircut" } },
      { id: "srv2", item_data: { name: "Massage" } },
    ]);
  }
});

/** ===============================
 * Bookings
 * =============================== */
// In-memory store for mock bookings
let mockBookings = [];

/** ===============================
 * Bookings
 * =============================== */
app.get("/api/bookings", async (req, res) => {
  try {
    const response = await client.bookings.list();
    res.json(response.bookings || mockBookings);
  } catch (err) {
    console.error("Bookings API error:", err);

    // Handle "Merchant not onboarded" gracefully
    res.json(mockBookings);
  }
});

/** ===============================
 * Create booking
 * =============================== */

app.post("/api/bookings", async (req, res) => {
  try {
    const bookingRequest = req.body.booking;

    const staffId = bookingRequest.appointment_segments?.[0]?.team_member_id;

    // Convert request times into EST (America/New_York)
    const start = DateTime.fromISO(bookingRequest.start_at, {
      zone: "utc",
    }).setZone("America/New_York");
    const end = DateTime.fromISO(bookingRequest.end_at, {
      zone: "utc",
    }).setZone("America/New_York");

    const startEST = start.toISO();
    const endEST = end.toISO();

    console.log("Checking conflict for:", {
      staffId,
      requestStartEST: startEST,
      requestEndEST: endEST,
      existingBookings: mockBookings.map((b) => ({
        id: b.id,
        staff: b.team_member_id,
        start: b.start_at,
        end: b.end_at,
      })),
    });

    // Conflict check in EST
    const conflict = mockBookings.some((b) => {
      const existingStart = DateTime.fromISO(b.start_at, {
        zone: "America/New_York",
      });
      const existingEnd = DateTime.fromISO(b.end_at, {
        zone: "America/New_York",
      });
      return (
        b.team_member_id === staffId &&
        existingStart < end &&
        existingEnd > start
      );
    });

    if (conflict) {
      return res.status(409).json({ error: "Time slot already booked" });
    }

    // Create booking in EST
    const booking = {
      id: randomId("booking"),
      customer: { display_name: bookingRequest.customer_id || "Test Customer" },
      start_at: startEST, // ✅ saved in EST
      end_at: endEST,
      team_member_id: staffId,
    };

    mockBookings.push(booking);

    res.json(booking);
  } catch (err) {
    console.error("Create booking API error:", err);
    res.status(500).json({ error: err.message });
  }
});

/** ===============================
 * Start server
 * =============================== */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
