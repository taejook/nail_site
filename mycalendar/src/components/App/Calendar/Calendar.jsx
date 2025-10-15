import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import BookingForm from "./BookingForm/BookingForm";
import {
  getLocations,
  getTeamMembers,
  getServices,
  getBookings,
  createBooking as createBookingApi,
} from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import "./Calendar.css";

export default function Calendar() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24, textAlign: "center" }}>Loading…</div>;
  }
  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h2>Please sign in to view and book appointments.</h2>
      </div>
    );
  }

  return <AuthedCalendar />;
}

function AuthedCalendar() {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fullNameId, setFullNameId] = useState("");
  const [emailId, setEmailId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTeamMember, setSelectedTeamMember] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [sidebarDay, setSidebarDay] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);

  // Load backend data once
  useEffect(() => {
    (async () => {
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
            team_member_id: b.team_member_id,
          }))
        );
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    })();
  }, []);

  // Compute 9–5 availability for selected day + staff
  useEffect(() => {
    if (!selectedTeamMember) {
      setAvailableSlots([]);
      return;
    }

    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const start = new Date(sidebarDay);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(sidebarDay);
      end.setHours(hour + 1, 0, 0, 0);

      const startMs = start.getTime();
      const endMs = end.getTime();

      const conflict = events.some((e) => {
        if (e.team_member_id !== selectedTeamMember) return false;
        const evStart = new Date(e.start).getTime();
        const evEnd = new Date(e.end).getTime();
        return evStart < endMs && evEnd > startMs;
      });

      slots.push({ start, end, conflict });
    }
    setAvailableSlots(slots);
  }, [events, sidebarDay, selectedTeamMember]);

  const createBooking = async () => {
    if (
      !fullNameId ||
      !emailId ||
      !phoneNumberId ||
      !selectedLocation ||
      !selectedTeamMember ||
      !selectedService
    ) {
      return alert("Please fill all fields!");
    }

    const payload = {
      booking: {
        fullName_id: fullNameId,
        email_id: emailId,
        phoneNumber_id: phoneNumberId,
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

    const data = await createBookingApi(payload);

    if (data?.id) {
      setEvents((prev) => [
        ...prev,
        {
          id: data.id,
          title: data.customer?.display_name || "Booking",
          start: data.start_at,
          end: data.end_at,
          team_member_id: selectedTeamMember,
        },
      ]);
      setShowBookingForm(false);
      setFullNameId("");
      setEmailId("");
      setPhoneNumberId("");
      setSelectedSlot(null);
      alert("Booking created!");
    } else {
      alert("Failed to create booking");
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-left">
        <div className="calendar-sidebar">
          <h3>📅 Select Date & Time</h3>
          <p>Choose your staff, service, location, and a time slot.</p>

          {/* Staff */}
          <div className="form-group">
            <label>Staff:</label>
            <select
              value={selectedTeamMember}
              onChange={(e) => setSelectedTeamMember(e.target.value)}
            >
              <option value="">Select Staff</option>
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.team_member_details?.given_name || tm.id}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mini calendar */}
          <div className="mini-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              select={(info) => setSidebarDay(new Date(info.startStr))}
              headerToolbar={{ left: "prev", center: "title", right: "next" }}
              height="auto"
              dayMaxEvents={true}
              events={events}
            />
          </div>

          {/* Time slots */}
          <div className="time-slots">
            {!selectedTeamMember ? (
              <p style={{ color: "#888", fontStyle: "italic" }}>
                Please select a staff member to see available slots
              </p>
            ) : (
              availableSlots.map((slot) => {
                const isBooked = slot.conflict;
                return (
                  <button
                    key={slot.start.toISOString()}
                    className={`time-slot-btn ${
                      isBooked ? "unavailable" : "available"
                    }`}
                    disabled={isBooked}
                    onClick={() => {
                      if (isBooked) return;
                      setSelectedSlot({
                        start: slot.start.toISOString(),
                        end: slot.end.toISOString(),
                      });
                      setShowBookingForm(true);
                    }}
                  >
                    {slot.start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {slot.end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isBooked && " (Booked)"}
                  </button>
                );
              })
            )}
          </div>

          <div className="legend">
            <span className="dot available"></span> Available
            <span className="dot unavailable"></span> Unavailable
          </div>
        </div>
      </div>

      <div className="calendar-right">
        {showBookingForm && (
          <BookingForm
            fullNameId={fullNameId}
            setFullNameId={setFullNameId}
            emailId={emailId}
            setEmailId={setEmailId}
            phoneNumberId={phoneNumberId}
            setPhoneNumberId={setPhoneNumberId}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            selectedTeamMember={selectedTeamMember}
            setSelectedTeamMember={setSelectedTeamMember}
            locations={locations}
            services={services}
            teamMembers={teamMembers}
            onSubmit={createBooking}
            onCancel={() => setShowBookingForm(false)}
          />
        )}
      </div>
    </div>
  );
}
