import React from "react";
import "./BookingForm.css";

export default function BookingForm({
  customerId = "",
  setCustomerId = () => {},
  selectedLocation = "",
  setSelectedLocation = () => {},
  selectedTeamMember = "",
  setSelectedTeamMember = () => {},
  selectedService = "",
  setSelectedService = () => {},
  locations = [],
  teamMembers = [],
  services = [],
  onSubmit = () => {},
  onCancel = () => {},
}) {
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeServices = Array.isArray(services) ? services : [];
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

  return (
    <div className="booking-form">
      <h3>Create Booking</h3>

      {/* Customer ID */}
      <div className="form-group">
        <label>Customer ID:</label>
        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="form-group">
        <label>Location:</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">Select Location</option>
          {safeLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Staff */}
      <div className="form-group">
        <label>Staff:</label>
        <select
          value={selectedTeamMember}
          onChange={(e) => setSelectedTeamMember(e.target.value)}
        >
          <option value="">Select Staff</option>
          {safeTeamMembers.map((tm) => (
            <option key={tm.id} value={tm.id}>
              {tm.team_member_details?.given_name || tm.id}
            </option>
          ))}
        </select>
      </div>

      {/* Service */}
      <div className="form-group">
        <label>Service:</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">Select Service</option>
          {safeServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.item_data?.name || s.id}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button className="primary-btn" onClick={onSubmit}>
          Create Booking
        </button>
        <button className="secondary-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
