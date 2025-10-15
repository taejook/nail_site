// utils/mailer.js
const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  OWNER_EMAIL,
  SITE_NAME = "Lucy Nailed It",
} = process.env;

// Create a reusable transporter (SMTP)
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT) === 465, // true for 465, false otherwise
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

function fmt(dtIso) {
  try {
    const d = new Date(dtIso);
    return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return dtIso;
  }
}

async function sendOwnerBookingEmail({ booking, customerEmail }) {
  if (!OWNER_EMAIL) return;

  const { customer, start_at, end_at, team_member_id } = booking;

  const html = `
    <h2>New Booking</h2>
    <p><b>Customer:</b> ${customer?.display_name || "Unknown"}</p>
    <p><b>Email:</b> ${customerEmail || "—"}</p>
    <p><b>When:</b> ${fmt(start_at)} – ${fmt(end_at)}</p>
    <p><b>Staff:</b> ${team_member_id || "—"}</p>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to: OWNER_EMAIL,
    subject: `New booking: ${customer?.display_name || "Customer"} (${fmt(start_at)})`,
    html,
  });
}

async function sendCustomerBookingEmail({ booking, to }) {
  if (!to) return;

  const { customer, start_at, end_at } = booking;

  const html = `
    <h2>Booking Confirmed</h2>
    <p>Hi ${customer?.display_name || "there"},</p>
    <p>Your appointment is booked for <b>${fmt(start_at)}</b> – <b>${fmt(end_at)}</b>.</p>
    <p>See you soon!</p>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to,
    subject: `Your booking is confirmed (${fmt(start_at)})`,
    html,
  });
}

module.exports = {
  sendOwnerBookingEmail,
  sendCustomerBookingEmail,
};
