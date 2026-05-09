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
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsAdmin(user?.user_metadata?.role === 'admin');
    });

    fetchServices();
    fetchQueues();

    // Optional: Could set up realtime subscription here, 
    // but polling/fetching on load/action is fine for now.
  }, []);

  const fetchQueues = async () => {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('status', 'waiting');
      if (!error && data) {
        setQueues(data);
      }
    } catch (err) {
      console.error('Error fetching queues', err);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setServices(data.map(svc => ({
          id: svc.id,
          name: svc.name,
          icon: svc.icon || '🏢',
          wait: svc.estimated_wait_time || 10,
          color: svc.color || '#6c63ff'
        })));
      } else {
        setFallbackServices();
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setFallbackServices();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackServices = () => {
    setServices([
      { id: 1, name: 'Registrar Office', icon: '📋', wait: 15, color: '#6c63ff' },
      { id: 2, name: 'Financial Aid', icon: '💰', wait: 25, color: '#f5a623' },
      { id: 3, name: 'Cashier', icon: '🧾', wait: 10, color: '#2dd4a0' },
    ]);
  };

  const joinQueue = async (serviceId) => {
    if (!user) return alert('Please wait for user info to load.');
    try {
      const { error } = await supabase.from('queue_entries').insert({
        user_id: user.id,
        service_id: serviceId,
        status: 'waiting'
      });
      if (error) {
        if (error.message.includes('relation "public.queue_entries" does not exist')) {
          alert('Database not configured yet. Please run the setup script in Supabase first!');
          return;
        }
        throw error;
      }
      alert('Successfully joined the queue!');
      fetchQueues();
    } catch (err) {
      alert('Error joining queue: ' + err.message);
    }
  };

  const removeNextFromQueue = async (serviceId) => {
    const serviceQueues = queues
      .filter(q => q.service_id === serviceId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (serviceQueues.length === 0) {
      alert('Queue is already empty.');
      return;
    }

    const nextEntry = serviceQueues[0];

    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: 'completed' })
        .eq('id', nextEntry.id);
      
      if (error) throw error;
      alert('Removed next person from queue.');
      fetchQueues();
    } catch (err) {
      alert('Error updating queue: ' + err.message);
    }
  };

  const getAvatarInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
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
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="nav-avatar">{getAvatarInitials()}</div>
            )}
            <div className="nav-uname">{user?.user_metadata?.full_name || 'Student'}</div>
          </div>
        </div>
      </nav>

      <div className="home-body">
        <ActiveQueueBanner />
        
        <div className="page-head slide-up">
          <h1>Campus<br/><span>Services</span></h1>
          <p>Join a queue and track your position in real-time</p>
          {isAdmin && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 15px', borderRadius: '8px', marginTop: '15px', display: 'inline-block' }}>
              <strong>Admin Mode Active</strong> - You have permission to manage queues.
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading services...</p>
          </div>
        ) : (
          <div className="services-grid stagger-in">
            {services.map(svc => {
              // Calculate actual queue length from database entries if available
              const queueLength = queues.filter(q => q.service_id === svc.id).length;
              
              return (
                <div className="svc-card pop-in" key={svc.id}>
                  <div className="sc-header">
                    <div className="sc-icon" style={{ backgroundColor: svc.color + '22', color: svc.color }}>{svc.icon}</div>
                    <div className="sc-status sc-status-open">Open</div>
                  </div>
                  <div className="sc-title">{svc.name}</div>
                  <div className="sc-stats">
                    <div className="sc-stat"><span>👥</span> {queueLength} in queue</div>
                    <div className="sc-stat"><span>⏱</span> ~{svc.wait} min</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn-join btn-glow" 
                      style={{ backgroundColor: svc.color, flex: 1 }}
                      onClick={() => joinQueue(svc.id)}
                    >
                      Join Queue
                    </button>
                    {isAdmin && (
                      <button 
                        className="btn-join" 
                        style={{ backgroundColor: '#ef4444', flex: 1 }}
                        onClick={() => removeNextFromQueue(svc.id)}
                      >
                        Next (Minus)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
