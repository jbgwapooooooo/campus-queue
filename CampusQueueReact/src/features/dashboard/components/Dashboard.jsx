import React, { useState, useEffect } from 'react';
import { ActiveQueueBanner } from '../../queue/components/ActiveQueueBanner';
import { supabase } from '../../../supabaseClient';

/**
 * Vertical Slice: Dashboard
 * Handles the display of available services.
 */
export const Dashboard = ({ onProfileClick }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map Supabase columns to UI properties if needed
        // Assuming data has id, name, description, status, etc.
        setServices(data.map(svc => ({
          id: svc.id,
          name: svc.name,
          icon: svc.icon || '🏢',
          wait: svc.estimated_wait_time || 10,
          q: svc.current_queue_length || 0,
          color: svc.color || '#6c63ff'
        })));
      } else {
        // Fallback or empty state
        setServices([
          { id: 1, name: 'Registrar Office', icon: '📋', wait: 15, q: 8, color: '#6c63ff' },
          { id: 2, name: 'Financial Aid', icon: '💰', wait: 25, q: 12, color: '#f5a623' },
          { id: 3, name: 'Cashier', icon: '🧾', wait: 10, q: 5, color: '#2dd4a0' },
        ]);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      // Fallback on error
      setServices([
        { id: 1, name: 'Registrar Office', icon: '📋', wait: 15, q: 8, color: '#6c63ff' },
        { id: 2, name: 'Financial Aid', icon: '💰', wait: 25, q: 12, color: '#f5a623' },
        { id: 3, name: 'Cashier', icon: '🧾', wait: 10, q: 5, color: '#2dd4a0' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active fade-in" style={{ display: 'block', paddingBottom: '50px' }}>
      <nav className="navbar glass">
        <div className="nav-logo">
          <div className="nav-icon pulse-soft">🎓</div>
          <div>
            <div className="nav-title">Campus Queue</div>
            <div className="nav-subtitle">CIT Dashboard</div>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-user-chip hover-scale" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
            <div className="nav-avatar">SR</div>
            <div className="nav-uname">Student React</div>
          </div>
        </div>
      </nav>

      <div className="home-body">
        <ActiveQueueBanner />
        
        <div className="page-head slide-up">
          <h1>Campus<br/><span>Services</span></h1>
          <p>Join a queue and track your position in real-time</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading services...</p>
          </div>
        ) : (
          <div className="services-grid stagger-in">
            {services.map(svc => (
              <div className="svc-card pop-in" key={svc.id}>
                <div className="sc-header">
                  <div className="sc-icon" style={{ backgroundColor: svc.color + '22', color: svc.color }}>{svc.icon}</div>
                  <div className="sc-status sc-status-open">Open</div>
                </div>
                <div className="sc-title">{svc.name}</div>
                <div className="sc-stats">
                  <div className="sc-stat"><span>👥</span> {svc.q} in queue</div>
                  <div className="sc-stat"><span>⏱</span> ~{svc.wait} min</div>
                </div>
                <button className="btn-join btn-glow" style={{ backgroundColor: svc.color }}>Join Queue</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
