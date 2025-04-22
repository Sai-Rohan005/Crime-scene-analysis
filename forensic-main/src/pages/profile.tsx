import React from "react";
import "./css/profile.css";

const Profile: React.FC = () => {
  return (
    <div className="profile-wrapper d-flex justify-content-center align-items-center">
      <div className="profile-card text-center p-4 bg-white rounded shadow">
        
        {/* Profile Image */}
        <div className="mb-3">
          <img
            src="https://via.placeholder.com/70"
            alt="Profile"
            className="profile-img"
          />
        </div>

        {/* Email */}
        <div className="mb-2">
          <label className="form-label fw-semibold">Email</label>
          <div className="form-control-plaintext">user@example.com</div>
        </div>

        {/* Username */}
        <div className="mb-2">
          <label className="form-label fw-semibold">Username</label>
          <div className="form-control-plaintext">john_doe</div>
        </div>

        {/* Bio */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Bio</label>
          <div className="form-control-plaintext">
            Full-stack developer with a love for design and clean code.
          </div>
        </div>

        <button className="btn btn-primary w-100">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile;
