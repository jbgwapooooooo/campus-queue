import React from 'react';
import { ActiveQueueBanner } from '../../queue/components/ActiveQueueBanner';

/**
 * Vertical Slice: Dashboard
 * Handles the display of available services.
 */
export const Dashboard = ({ onProfileClick }) => {
  const DEMO_SERVICES = [
    { id: 1, name: 'Registrar Office', icon: '📋', wait: 15, q: 8, color: '#6c63ff' },
    { id: 2, name: 'Financial Aid', icon: '💰', wait: 25, q: 12, color: '#f5a623' },
    { id: 3, name: 'Cashier', icon: '🧾', wait: 10, q: 5, color: '#2dd4a0' },
  ];

  return (
    <div className="page active" style={{ display: 'block', paddingBottom: '50px' }}>
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-icon">🎓</div>
          <div>
            <div className="nav-title">Campus Queue</div>
            <div className="nav-subtitle">CIT Dashboard</div>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-user-chip" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
            <div className="nav-avatar">SR</div>
            <div className="nav-uname">Student React</div>
          </div>
        </div>
      </nav>

      <div className="home-body">
        <ActiveQueueBanner />
        
        <div className="page-head">
          <h1>Campus<br/><span>Services</span></h1>
          <p>Join a queue and track your position in real-time</p>
        </div>

        <div className="services-grid">
          {DEMO_SERVICES.map(svc => (
            <div className="svc-card" key={svc.id}>
              <div className="sc-header">
                <div className="sc-icon" style={{ backgroundColor: svc.color + '22', color: svc.color }}>{svc.icon}</div>
                <div className="sc-status sc-status-open">Open</div>
              </div>
              <div className="sc-title">{svc.name}</div>
              <div className="sc-stats">
                <div className="sc-stat"><span>👥</span> {svc.q} in queue</div>
                <div className="sc-stat"><span>⏱</span> ~{svc.wait} min</div>
              </div>
              <button className="btn-join" style={{ backgroundColor: svc.color }}>Join Queue</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
