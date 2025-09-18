// BookingSection.jsx
import { useState, useEffect } from "react";
import Calendar from "../Calendar";
import BookingForm from "../BookingForm/BookingForm";
import "./BookingSection.css";

export default function BookingSection() {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTeamMember, setSelectedTeamMember] = useState("");
  const [selectedService, setSelectedService] = useState("");

  // Fetch data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [locRes, teamRes, serviceRes, bookingRes] = await Promise.all([
          fetch("http://localhost:4000/api/locations").then((r) => r.json()),
          fetch("http://localhost:4000/api/team-members").then((r) => r.json()),
          fetch("http://localhost:4000/api/services").then((r) => r.json()),
          fetch("http://localhost:4000/api/bookings").then((r) => r.json()),
        ]);
        setLocations(Array.isArray(locRes) ? locRes : []);
        setTeamMembers(teamRes?.team_members || []);
        setServices(serviceRes?.objects || []);
        setEvents(
          Array.isArray(bookingRes)
            ? bookingRes.map((b) => ({
                id: b.id,
                title: b.customer?.display_name || "Booking",
                start: b.start_at,
                end: b.end_at,
              }))
            : []
        );
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    }
    loadData();
  }, []);

  const handleDateSelect = (selectInfo) => {
    setSelectedSlot({ start: selectInfo.startStr, end: selectInfo.endStr });
    setShowBookingForm(true);
  };

  const createBooking = async () => {
    if (!customerId || !selectedLocation || !selectedTeamMember || !selectedService) {
      return alert("Please fill all fields!");
    }
    // payload here...
  };

  return (
    <section className="booking-container">
      <div className="booking-content">
        {showBookingForm && (
          <BookingForm
            customerId={customerId}
            setCustomerId={setCustomerId}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedTeamMember={selectedTeamMember}
            setSelectedTeamMember={setSelectedTeamMember}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            locations={locations}
            teamMembers={teamMembers}
            services={services}
            onSubmit={createBooking}
            onCancel={() => setShowBookingForm(false)}
          />
        )}
      </div>
    </section>
  );
}
