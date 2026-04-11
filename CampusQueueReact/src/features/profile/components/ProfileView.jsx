import React from 'react';

/**
 * Vertical Slice: Profile
 * Handles user profile display and editing.
 */
export const ProfileView = ({ onBack }) => {
  return (
    <div className="page active profile-theme" style={{ display: 'block' }}>
      <nav className="navbar profile-nav">
        <div className="nav-logo">
          <div className="nav-ico-btn" onClick={onBack} style={{ background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            ←
          </div>
          <div>
            <div className="nav-title" style={{ color: '#111' }}>Campus Queue</div>
            <div className="nav-subtitle" style={{ color: '#666' }}>Profile</div>
          </div>
        </div>
      </nav>

      <div className="profile-body">
        <div className="profile-card">
          <div className="pc-header">
            <div className="pc-avatar">SR</div>
            <div className="pc-title">
              <div className="pc-name">Student React</div>
              <div className="pc-sid">Student ID: 2024-00000</div>
            </div>
            <button className="btn-edit-prof">Edit</button>
          </div>

          <div>
            <div className="pc-row">
              <span className="pc-lbl">Email</span>
              <span className="pc-val">react@cit.edu</span>
            </div>
            <div className="pc-row">
              <span className="pc-lbl">Total Queues Joined</span>
              <span className="pc-val">5</span>
            </div>
            <div className="pc-row" style={{ borderBottom: 'none' }}>
              <span className="pc-lbl">Member Since</span>
              <span className="pc-val">React Migration 2026</span>
            </div>
          </div>
        </div>
        <button className="btn-signout" onClick={onBack}>Sign Out</button>
      </div>
    </div>
  );
};
