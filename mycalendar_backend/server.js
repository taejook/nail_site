require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { celebrateErrors } = require("./middleware/validator");
const { DateTime } = require("luxon");
const {
  sendOwnerBookingEmail,
  sendCustomerBookingEmail,
} = require("./utils/mailer");
const Square = require("square");

const {
  SQUARE_ACCESS_TOKEN,

  // Email envs
  SMTP_HOST,
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL, 
  OWNER_EMAIL, 
} = process.env;

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.get("/api/auth/ping", (req, res) => res.json({ ok: true }));

app.use(celebrateErrors());

// ----- Square client

function randomId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}
let ClientCtor, EnvObj;

// Newer SDK (v35+): Client / Environment
if (Square.Client && Square.Environment) {
  ClientCtor = Square.Client;
  EnvObj = Square.Environment;
} else if (Square.SquareClient && Square.SquareEnvironment) {
  // Older SDK: SquareClient / SquareEnvironment
  ClientCtor = Square.SquareClient;
  EnvObj = Square.SquareEnvironment;
} else {
  throw new Error(
    "Square SDK not recognized. Ensure the 'square' package is installed."
  );
}

const client = new ClientCtor({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: EnvObj.Sandbox,
});

app.get("/api/test", (req, res) => res.json({ message: "Backend running ✅" }));

//Mailer
const transporter =
  SMTP_HOST && (SMTP_USER || SMTP_PASS)
    ? nodemailer.createTransport({
        host: SMTP_HOST, // smtp.gmail.com
        port: Number(SMTP_PORT), // 465
        secure: Number(SMTP_PORT) === 465, // true for 465
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    : null;

function fmtNY(iso) {
  return DateTime.fromISO(iso)
    .setZone("America/New_York")
    .toLocaleString(DateTime.DATETIME_MED);
}

async function emailOwner({ booking, customerEmail }) {
  if (!transporter || !OWNER_EMAIL) return;
  const { customer, start_at, end_at, team_member_id } = booking;

  await transporter.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to: OWNER_EMAIL,
    subject: `New booking: ${customer?.display_name || "Customer"} (${fmtNY(
      start_at
    )})`,
    html: `
      <h2>New Booking</h2>
      <p><b>Customer:</b> ${customer?.display_name || "Unknown"}</p>
      <p><b>Email:</b> ${customerEmail || "—"}</p>
      <p><b>When:</b> ${fmtNY(start_at)} – ${fmtNY(end_at)}</p>
      <p><b>Staff:</b> ${team_member_id || "—"}</p>
    `,
  });
}

async function emailCustomer({ booking, to }) {
  if (!transporter || !to) return;
  const { customer, start_at, end_at } = booking;

  await transporter.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to,
    subject: `Your booking is confirmed (${fmtNY(start_at)})`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Hi ${customer?.display_name || "there"},</p>
      <p>Your appointment is booked for <b>${fmtNY(start_at)}</b> – <b>${fmtNY(
      end_at
    )}</b>.</p>
      <p>See you soon!</p>
    `,
  });
}

// Square API (new SDK surface)
// Locations
app.get("/api/locations", async (req, res) => {
  try {
    if (client.locationsApi) {
      // New SDK
      const { result } = await client.locationsApi.listLocations();
      return res.json(result.locations ?? []);
    } else {
      // Old SDK
      const response = await client.locations.list();
      return res.json(response.locations ?? []);
    }
  } catch (err) {
    console.error("Locations API error:", err);
    return res.json([
      { id: "loc1", name: "Mock Location 1" },
      { id: "loc2", name: "Mock Location 2" },
    ]);
  }
});

// Team members
app.get("/api/team-members", async (req, res) => {
  try {
    if (client.teamApi) {
      const { result } = await client.teamApi.searchTeamMembers({});
      return res.json({ team_members: result.teamMembers ?? [] });
    } else {
      const response = await client.teamMembers.search({});
      return res.json(response.result ?? { team_members: [] });
    }
  } catch (err) {
    console.error("Team members API error:", err);
    return res.json({
      team_members: [
        {
          id: "test1",
          team_member_details: { given_name: "Lucy", family_name: "Oh" },
        },
      ],
    });
  }
});

// Services (Catalog)
app.get("/api/services", async (req, res) => {
  try {
    if (client.catalogApi) {
      const { result } = await client.catalogApi.listCatalog(undefined, "ITEM");
      return res.json(result.objects ?? []);
    } else {
      const response = await client.catalog.list({ types: ["ITEM"] });
      return res.json(response.objects ?? []);
    }
  } catch (err) {
    console.error("Services API error:", err);
    return res.json([
      { id: "srv1", item_data: { name: "Haircut" } },
      { id: "srv2", item_data: { name: "Massage" } },
    ]);
  }
});

let mockBookings = [];

// Bookings
app.get("/api/bookings", async (req, res) => {
  try {
    if (client.bookingsApi) {
      const { result } = await client.bookingsApi.listBookings();
      return res.json(result.bookings ?? mockBookings);
    } else {
      const response = await client.bookings.list();
      return res.json(response.bookings ?? mockBookings);
    }
  } catch (err) {
    console.error("Bookings API error:", err);
    return res.json(mockBookings);
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const bookingRequest = req.body.booking;
    const staffId = bookingRequest.appointment_segments?.[0]?.team_member_id;

    const start = DateTime.fromISO(bookingRequest.start_at);
    const end = DateTime.fromISO(bookingRequest.end_at);

    // Conflict check using stored UTC timestamps
    const conflict = mockBookings.some((b) => {
      const existingStart = DateTime.fromISO(b.start_at);
      const existingEnd = DateTime.fromISO(b.end_at);
      return (
        b.team_member_id === staffId &&
        existingStart < end &&
        existingEnd > start
      );
    });

    if (conflict)
      return res.status(409).json({ error: "Time slot already booked" });

    const customerName =
      (req.user && (req.user.fullName || req.user.name || req.user.email)) ||
      bookingRequest.fullName ||
      bookingRequest.fullName_id ||
      bookingRequest.customer_name ||
      "Customer";

    const customerEmail =
      (req.user && req.user.email) ||
      bookingRequest.email ||
      bookingRequest.email_id ||
      null;

    const booking = {
      id: randomId("booking"),
      customer: { display_name: customerName },
      start_at: start.toISO(),
      end_at: end.toISO(),
      team_member_id: staffId,
    };

    mockBookings.push(booking);

    emailOwner({ booking, customerEmail }).catch((e) =>
      console.error("Owner email failed:", e)
    );
    emailCustomer({ booking, to: customerEmail }).catch((e) =>
      console.error("Customer email failed:", e)
    );

    res.json(booking);
  } catch (err) {
    console.error("Create booking API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `No route: ${req.method} ${req.originalUrl}` });
});

// Mongo connect (no deprecated options) THEN start HTTP server
const PORT = process.env.PORT || 3001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lucynailedit";

mongoose.set("strictQuery", true); 
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); 
  });

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
