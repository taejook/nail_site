import { useState, useEffect } from "react";
import Calendar from "../Calendar";
import BookingForm from "../BookingForm/BookingForm";
import {
  getLocations,
  getTeamMembers,
  getServices,
  getBookings,
  createBooking as createBookingApi,
} from "../../../../utils/api";
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

  useEffect(() => {
    async function loadData() {
      try {
        const [locRes, teamRes, serviceRes, bookingRes] = await Promise.all([
          getLocations(),
          getTeamMembers(),
          getServices(),
          getBookings(),
        ]);

        setLocations(locRes);
        setTeamMembers(teamRes);
        setServices(serviceRes);
        setEvents(
          bookingRes.map((b) => ({
            id: b.id,
            title: b.customer?.display_name || "Booking",
            start: b.start_at,
            end: b.end_at,
          }))
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
    if (
      !customerId ||
      !selectedLocation ||
      !selectedTeamMember ||
      !selectedService
    ) {
      return alert("Please fill all fields!");
    }

    const payload = {
      booking: {
        customer_id: customerId,
        location_id: selectedLocation,
        start_at: selectedSlot.start,
        end_at: selectedSlot.end,
        appointment_segments: [
          {
            team_member_id: selectedTeamMember,
            service_variation_id: selectedService,
            service_variation_version: 1,
          },
        ],
      },
    };

    const newBooking = await createBookingApi(payload);
    if (newBooking?.id) {
      setEvents((prev) => [
        ...prev,
        {
          id: newBooking.id,
          title: newBooking.customer?.display_name || "Booking",
          start: newBooking.start_at,
          end: newBooking.end_at,
        },
      ]);
      setShowBookingForm(false);
    } else {
      alert("Failed to create booking");
    }
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
