import React from "react";
import "./BookingForm.css";

export default function BookingForm({
  user,
  fullNameId = "",
  setFullNameId = () => {},
  emailId = "",
  setEmailId = () => {},
  phoneNumberId = "",
  setPhoneNumberId = () => {},
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

  const autofullName = user?.fullName ?? fullNameId;
  const autoEmail = user?.email ?? emailId;
  const readOnly = Boolean(user); // lock when logged in
  const autoPhone = user?.phoneNumber ?? phoneNumberId;

  return (
    <div className="booking-form">
      <h3>Create Booking</h3>

      <div className="form-group">
        <label>Full Name:</label>
        <input
          type="text"
          value={autofullName}
          onChange={(e) => setFullNameId(e.target.value)}
          readOnly={readOnly}
          placeholder={readOnly && !user?.email ? "Enter full name" : ""}
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="text"
          value={autoEmail}
          onChange={(e) => setEmailId(e.target.value)}
          readOnly={readOnly}
          placeholder={readOnly && !user?.email ? "Enter email" : ""}
        />
      </div>

      <div className="form-group">
        <label>Phone Number:</label>
        <input
          type="text"
          value={autoPhone}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          readOnly={readOnly && !!user?.phoneNumber}
          placeholder={readOnly && !user?.phoneNumber ? "Enter phone number" : ""}
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
        <button
          className="primary-btn"
          onClick={onSubmit}
          disabled={
            !fullNameId ||
            !emailId ||
            !phoneNumberId ||
            !selectedLocation ||
            !selectedTeamMember ||
            !selectedService
          }
        >
          Create Booking
        </button>

        <button className="secondary-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
