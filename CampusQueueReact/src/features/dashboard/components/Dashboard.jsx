import React, { useState, useEffect, useRef } from 'react';
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
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const welcomeShown = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsAdmin(user?.email === 'admin@cit.edu');
      
      if (user && user.email !== 'admin@cit.edu' && !welcomeShown.current) {
        welcomeShown.current = true;
        setNotifs(prev => [{
          id: 'welcome-' + Date.now(),
          title: '👋 Welcome back!',
          message: `Good to see you, ${user.user_metadata?.full_name || user.email.split('@')[0]}!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev]);
      }
    });

    fetchServices();
    fetchQueues();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries' }, (payload) => {
        fetchQueues();
        fetchServices();
        
        // If the student was 'called'
        if (payload.new && payload.new.user_id === user?.id && payload.new.status === 'called' && payload.old?.status !== 'called') {
          setNotifs(prev => [{
            id: Date.now(),
            title: '📢 It is your turn!',
            message: 'Please proceed to the office now.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'services' }, () => {
        fetchServices();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        // If current user's profile was updated
        if (payload.new && payload.new.auth_id === user?.id) {
          setNotifs(prev => [{
            id: Date.now(),
            title: '👤 Profile Updated',
            message: 'Your profile changes have been saved.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueues = async () => {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          *,
          user_profile:users!fk_queue_user_profile(full_name, email)
        `)
        .in('status', ['waiting', 'called'])
        .order('joined_at', { ascending: true });
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
          wait: svc.wait_time_min || 10,
          count: svc.queue_count || 0,
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
      // 1. Ensure user profile exists in public.users table so Admin can see them
      await supabase.from('users').upsert({
        auth_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0]
      }, { onConflict: 'auth_id' });

      // 2. Check if user is already in any active queue
      const { data: existing, error: checkError } = await supabase
        .from('queue_entries')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'called'])
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        alert('You are already in a queue! Please leave or finish your current queue before joining a new one.');
        return;
      }

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
      const svc = services.find(s => s.id === serviceId);
      setNotifs(prev => [{
        id: Date.now(),
        title: '✅ Joined Queue',
        message: `You have successfully joined the ${svc?.name || 'service'} line.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);

      alert('Successfully joined the queue!');
      fetchQueues();
    } catch (err) {
      alert('Error joining queue: ' + err.message);
    }
  };

  const updateEntryStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchQueues();
      if (newStatus === 'called') {
        alert('User has been notified/called!');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const removeNextFromQueue = async (serviceId) => {
    const serviceQueues = queues
      .filter(q => q.service_id === serviceId && q.status === 'waiting')
      .sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at));

    if (serviceQueues.length === 0) {
      alert('Queue is already empty.');
      return;
    }

    updateEntryStatus(serviceQueues[0].id, 'completed');
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
        <div className="nav-right" style={{ position: 'relative' }}>
          {!isAdmin && (
            <>
              <button 
                className="nav-ico-btn" 
                title="Notifications" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifs(!showNotifs);
                }}
                style={{ zIndex: 1001, pointerEvents: 'auto' }}
              >
                {notifs.length > 0 && <span className="notif-dot" style={{ pointerEvents: 'none' }}>{notifs.length}</span>}
                🔔
              </button>
              
              {showNotifs && (
                <div className="notif-panel slide-up">
                  <div className="np-header">
                    <h2>Notifications</h2>
                    <div className="np-more" onClick={() => setNotifs([])} title="Clear All">Clear</div>
                  </div>

                  <div className="np-body">
                    <div className="np-section-head">
                      <span>Recent Updates</span>
                    </div>

                    {notifs.length === 0 ? (
                      <div className="np-empty">No new notifications</div>
                    ) : (
                      notifs.map(n => (
                        <div key={n.id} className="np-item">
                          <div className="np-avatar-wrap">
                            <div className="np-avatar">
                              {n.title.includes('called') ? '📢' : (n.title.includes('Profile') ? '👤' : '🎓')}
                            </div>
                            <div className="np-badge">
                              {n.title.includes('called') ? '⚡' : '✓'}
                            </div>
                          </div>
                          <div className="np-content">
                            <div className="np-text">
                              <strong>{n.title}</strong> {n.message}
                            </div>
                            <div className="np-time">{n.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
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
          <h1>{isAdmin ? 'Admin' : 'Campus'}<br/><span>{isAdmin ? 'Console' : 'Services'}</span></h1>
          <p>{isAdmin ? 'Manage student queues and office services' : 'Join a queue and track your position in real-time'}</p>
          {isAdmin && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 15px', borderRadius: '8px', marginTop: '15px', display: 'inline-block' }}>
              <strong>Admin Mode</strong> — Authorized Access
            </div>
          )}
        </div>

        {!isAdmin && loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner-large"></div>
            <p>Loading services...</p>
          </div>
        ) : (
          !isAdmin && (
            <div className="services-grid stagger-in">
              {services.map(svc => {
                const queueLength = queues.filter(q => Number(q.service_id) === Number(svc.id) && q.status === 'waiting').length;
                return (
                  <div className="svc-card-new pop-in" key={svc.id}>
                    <div className="scn-glow" style={{ background: svc.color }}></div>
                    <div className="scn-header">
                      <div className="scn-icon" style={{ backgroundColor: svc.color + '22', color: svc.color }}>{svc.icon}</div>
                      <div className="scn-badge">OPEN</div>
                    </div>
                    <div className="scn-body">
                      <div className="scn-title">{svc.name}</div>
                      <div className="scn-stats">
                        <div className="scn-stat">
                          <span className="scn-stat-icon">👥</span>
                          <div className="scn-stat-info">
                            <span className="scn-stat-val">{svc.count}</span>
                            <span className="scn-stat-lbl">In Line</span>
                          </div>
                        </div>
                        <div className="scn-stat">
                          <span className="scn-stat-icon">⏱</span>
                          <div className="scn-stat-info">
                            <span className="scn-stat-val">~{svc.wait}</span>
                            <span className="scn-stat-lbl">Mins Wait</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="scn-btn" 
                      style={{ backgroundColor: svc.color }}
                      onClick={() => joinQueue(svc.id)}
                    >
                      Join Queue
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}

        {isAdmin && (
          <div className="admin-queue-manager slide-up" style={{ marginTop: '40px' }}>
            <div className="section-head">
              <h2>Queue Management</h2>
              <button className="btn-refresh-premium" onClick={fetchQueues}>
                Refresh List
              </button>
            </div>
            
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Wait Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queues.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No active students in queue.</td></tr>
                  ) : (
                    queues.map((entry, idx) => {
                      const svc = services.find(s => s.id === entry.service_id);
                      const timeInQueue = Math.floor((new Date() - new Date(entry.joined_at)) / 60000);
                      
                      return (
                        <tr key={entry.id} className={entry.status === 'called' ? 'row-called' : ''}>
                          <td>
                            <div style={{fontWeight: 'bold'}}>{entry.user_profile?.full_name || 'Anonymous Student'}</div>
                            <div style={{fontSize: '0.8rem', color: '#666'}}>{entry.user_profile?.email || 'No email provided'}</div>
                          </td>
                          <td>{svc?.name || 'Service #' + entry.service_id}</td>
                          <td>
                            <span className={`status-pill ${entry.status}`}>
                              {entry.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{timeInQueue} mins</td>
                          <td>
                            <div style={{display: 'flex', gap: '5px'}}>
                              {entry.status !== 'called' && (
                                <button className="btn-table call" onClick={() => updateEntryStatus(entry.id, 'called')}>Call</button>
                              )}
                              <button className="btn-table done" onClick={() => updateEntryStatus(entry.id, 'completed')}>Done</button>
                              <button className="btn-table remove" onClick={() => updateEntryStatus(entry.id, 'cancelled')}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="section-head" style={{ marginTop: '40px' }}>
              <h2>Office Services (Edit)</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Icon</th>
                    <th>Est. Wait (min)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => (
                    <tr key={svc.id}>
                      <td><input type="text" defaultValue={svc.name} className="admin-input" id={`svc-name-${svc.id}`} /></td>
                      <td><input type="text" defaultValue={svc.icon} className="admin-input" style={{width: '40px'}} id={`svc-icon-${svc.id}`} /></td>
                      <td><input type="number" defaultValue={svc.wait} className="admin-input" style={{width: '60px'}} id={`svc-wait-${svc.id}`} /></td>
                      <td>
                        <button className="btn-table call" onClick={async () => {
                          const name = document.getElementById(`svc-name-${svc.id}`).value;
                          const icon = document.getElementById(`svc-icon-${svc.id}`).value;
                          const wait = document.getElementById(`svc-wait-${svc.id}`).value;
                          const { error } = await supabase.from('services').update({ name, icon, wait_time_min: parseInt(wait) }).eq('id', svc.id);
                          if (error) alert(error.message);
                          else { alert('Service updated!'); fetchServices(); }
                        }}>Save</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-input {
          padding: 8px;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          width: 100%;
          font-size: 0.9rem;
          outline: none;
          transition: 0.2s;
        }
        .admin-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .admin-queue-manager {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .admin-table-wrap {
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          padding: 12px;
          border-bottom: 2px solid #f3f4f6;
          color: #6b7280;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .admin-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .status-pill {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-pill.waiting { background: #dcfce7; color: #166534; }
        .status-pill.called { background: #fee2e2; color: #991b1b; animation: pulse 2s infinite; }
        
        .btn-table {
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }
        .btn-table.call { background: #2563eb; color: #fff; }
        .btn-table.done { background: #10b981; color: #fff; }
        .btn-table.remove { background: #f3f4f6; color: #4b5563; }
        .btn-table:hover { opacity: 0.8; transform: translateY(-1px); }
        
        .row-called { background: #fff1f2; }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .btn-refresh-premium {
          background: rgba(37, 99, 235, 0.08);
          border: 1px solid rgba(37, 99, 235, 0.2);
          color: #2563eb;
          padding: 8px 16px;
          border-radius: 40px;
          font-family: var(--fb);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-refresh-premium:hover {
          background: #2563eb;
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .btn-refresh-premium:active { transform: translateY(0); }
        
        .refresh-icon { display: inline-block; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .btn-refresh-premium:hover .refresh-icon { transform: rotate(180deg); }
        
        .nav-ico-btn {
          width: 38px; height: 38px;
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 10px;
          color: var(--muted);
          cursor: pointer;
          display: grid;
          place-items: center;
          position: relative;
          font-size: 1.1rem;
          margin-right: 8px;
          transition: all 0.2s;
        }
        .nav-ico-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--glow);
        }
        .notif-dot {
          position: absolute; top: -4px; right: -4px;
          background: #ef4444; color: #fff;
          width: 16px; height: 16px; border-radius: 50%;
          font-size: 10px; font-weight: bold;
          display: grid; place-items: center;
          border: 2px solid #fff;
        }
        .notif-panel {
          position: absolute;
          top: 60px;
          right: 0;
          width: 340px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          z-index: 2000;
          color: #1f2937;
          overflow: hidden;
          border: 1px solid #f3f4f6;
        }
        .np-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f3f4f6;
        }
        .np-header h2 { font-size: 1.1rem; font-weight: 700; margin: 0; }
        .np-more { 
          font-size: 0.8rem; color: #6366f1; font-weight: 600;
          cursor: pointer; padding: 4px 8px; border-radius: 6px;
          transition: 0.2s;
        }
        .np-more:hover { background: #f5f3ff; }
        
        .np-body { max-height: 400px; overflow-y: auto; }
        .np-section-head {
          padding: 12px 16px 8px;
          color: #6b7280; font-weight: 600; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        
        .np-item {
          padding: 12px 16px;
          display: flex;
          gap: 12px;
          align-items: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .np-item:hover { background: #f9fafb; }
        
        .np-avatar-wrap { position: relative; }
        .np-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: #f3f4f6; display: grid; place-items: center;
          font-size: 1.2rem;
        }
        .np-badge {
          position: absolute; bottom: -2px; right: -2px;
          width: 20px; height: 20px; border-radius: 50%;
          background: #6366f1; border: 2px solid #fff;
          display: grid; place-items: center; font-size: 0.6rem; color: #fff;
        }
        
        .np-content { flex: 1; }
        .np-text { font-size: 0.85rem; line-height: 1.4; color: #4b5563; }
        .np-text strong { color: #111; }
        .np-time { font-size: 0.75rem; color: #6366f1; margin-top: 4px; font-weight: 600; }
        
        .np-empty { text-align: center; padding: 40px 20px; color: #9ca3af; font-size: 0.9rem; }

        .svc-card-new {
          background: #ffffff;
          border-radius: 24px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #f3f4f6;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.03);
        }
        .svc-card-new:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #6366f1;
        }
        .scn-glow {
          position: absolute;
          top: -50px; right: -50px;
          width: 100px; height: 100px;
          filter: blur(40px);
          opacity: 0.1;
          pointer-events: none;
        }
        .scn-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scn-icon {
          width: 50px; height: 50px;
          border-radius: 14px;
          display: grid; place-items: center;
          font-size: 1.5rem;
        }
        .scn-badge {
          background: #dcfce7;
          color: #166534;
          padding: 4px 10px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .scn-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 12px;
        }
        .scn-stats {
          display: flex;
          gap: 15px;
        }
        .scn-stat {
          flex: 1;
          background: #f9fafb;
          padding: 12px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .scn-stat-icon { font-size: 1.1rem; }
        .scn-stat-info { display: flex; flex-direction: column; }
        .scn-stat-val { font-weight: 800; color: #111; font-size: 1rem; line-height: 1; }
        .scn-stat-lbl { font-size: 0.65rem; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
        
        .scn-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 16px;
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .scn-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .scn-btn:active { transform: translateY(0); }
      `}</style>
    </div>
  );
};
