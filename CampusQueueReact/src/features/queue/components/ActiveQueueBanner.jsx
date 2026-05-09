import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

/**
 * Vertical Slice: Queue
 * Dedicated components for queue business logic display.
 */
export const ActiveQueueBanner = () => {
  const [entry, setEntry] = useState(null);
  const [position, setPosition] = useState(0);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveEntry();

    // Subscribe to changes
    const channel = supabase
      .channel('queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries' }, () => {
        fetchActiveEntry();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's active entry (waiting or called)
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'called'])
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      if (data) {
        // Fetch service details separately to be safe
        const { data: svcData } = await supabase
          .from('services')
          .select('*')
          .eq('id', data.service_id)
          .single();
        
        setEntry(data);
        setService(svcData);

        // Calculate position
        const { count, error: countErr } = await supabase
          .from('queue_entries')
          .select('*', { count: 'exact', head: true })
          .eq('service_id', data.service_id)
          .eq('status', 'waiting')
          .lt('joined_at', data.joined_at);
        
        if (countErr) console.error('Count Error:', countErr);
        setPosition((count || 0) + 1);
      } else {
        setEntry(null);
      }
    } catch (err) {
      console.error('Banner Catch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const leaveQueue = async () => {
    if (!entry) return;
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: 'cancelled' })
        .eq('id', entry.id);
      
      if (error) throw error;
      setEntry(null);
    } catch (err) {
      alert('Error leaving queue: ' + err.message);
    }
  };

  if (loading || !entry) return null;

  const isCalled = entry.status === 'called';

  return (
    <div className={`active-queue-banner show ${isCalled ? 'called-state' : ''}`}>
      <div className="aqb-left">
        <div className="aqb-pulse">{isCalled ? '🔔' : '⏳'}</div>
        <div>
          <div className="aqb-title">{service?.name || 'CIT Service'}</div>
          <div className="aqb-sub">
            {isCalled 
              ? 'IT IS YOUR TURN! Please proceed to the office.' 
              : 'We\'ll notify you when it\'s your turn'}
          </div>
        </div>
      </div>
      {!isCalled && (
        <div style={{ textAlign: 'center' }}>
          <div className="aqb-pos">#{position}</div>
          <div className="aqb-pos-lbl">Your position</div>
        </div>
      )}
      {isCalled && (
        <div className="called-badge">PROCEED NOW</div>
      )}
      
      <style>{`
        .called-state {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
          border: 2px solid #fff;
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite;
        }
        .called-badge {
          background: #fff;
          color: #ef4444;
          padding: 5px 12px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.8rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};
