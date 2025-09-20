import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import BookingForm from "./BookingForm/BookingForm";
import "./Calendar.css";

export default function Calendar() {
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

  const [sidebarDay, setSidebarDay] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);

  // load backend data
  useEffect(() => {
    async function loadData() {
      try {
        const [locRes, teamRes, serviceRes, bookingRes] = await Promise.all([
          fetch("http://localhost:3001/api/locations").then((r) => r.json()),
          fetch("http://localhost:3001/api/team-members").then((r) => r.json()),
          fetch("http://localhost:3001/api/services").then((r) => r.json()),
          fetch("http://localhost:3001/api/bookings").then((r) => r.json()),
        ]);

        setLocations(Array.isArray(locRes) ? locRes : []);
        setTeamMembers(
          teamRes?.team_members || [
            {
              id: "test1",
              team_member_details: { given_name: "Lucy", family_name: "Oh" },
            },
          ]
        );
        setServices(
          serviceRes?.objects || [
            { id: "srv1", item_data: { name: "Manicure" } },
            { id: "srv2", item_data: { name: "Pedicure" } },
            { id: "srv3", item_data: { name: "Nail Art" } },
          ]
        );
        setEvents(
          Array.isArray(bookingRes)
            ? bookingRes.map((b) => ({
                id: b.id,
                title: b.customer?.display_name || "Booking",
                start: b.start_at,
                end: b.end_at,
                team_member_id: b.team_member_id || null,
              }))
            : []
        );
      } catch (err) {
        console.error("Failed to load data:", err);
        alert("Error loading data — check console");
      }
    }

    loadData();
  }, []);

  // available slots sidebar (9–5)
  useEffect(() => {
    if (!selectedTeamMember) {
      setAvailableSlots([]);
      return;
    }

    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      // Force slots to be in local time (no UTC shift)
      const start = new Date(sidebarDay);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(sidebarDay);
      end.setHours(hour + 1, 0, 0, 0);

      // Compare with events using getTime()
      const conflict = events.some((e) => {
        const eventStart = new Date(e.start).getTime();
        const eventEnd = new Date(e.end).getTime();
        return (
          e.team_member_id === selectedTeamMember &&
          eventStart < end.getTime() &&
          eventEnd > start.getTime()
        );
      });

      slots.push({ start, end, conflict });
    }
    setAvailableSlots(slots);
  }, [events, sidebarDay, selectedTeamMember]);

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

    try {
      const res = await fetch("http://localhost:4000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) return alert("This time slot is already booked.");

      const data = await res.json();
      if (data.id) {
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
        setCustomerId("");
        setSelectedSlot(null);
        alert("Booking created ✅");
      } else {
        alert("Failed to create booking — check console");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating booking — check console");
    }
  };

  return (
    <div className="calendar-container">
      {/* Sidebar on the left */}
      <div className="calendar-left">
        <div className="calendar-sidebar">
          <h3>📅 Select Date & Time</h3>
          <p>Choose your staff, service, location, and a time slot.</p>

          {/* Staff Selector */}
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

          {/* Location Selector */}
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
              headerToolbar={{
                left: "prev",
                center: "title",
                right: "next",
              }}
              height="auto"
              dayMaxEvents={true}
              events={events} // ✅ show bookings on mini calendar
            />
          </div>

          {/* Time Slots */}
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
          {/* Legend */}
          <div className="legend">
            <span className="dot available"></span> Available
            <span className="dot unavailable"></span> Unavailable
          </div>
        </div>
      </div>

      {/* Booking form on the right */}
      <div className="calendar-right">
        {showBookingForm && (
          <BookingForm
            customerId={customerId}
            setCustomerId={setCustomerId}
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
