import React, { useState } from 'react';

/**
 * Vertical Slice: Queue
 * Dedicated components for queue business logic display.
 */
export const ActiveQueueBanner = () => {
  const [inQueue, setInQueue] = useState(true);

  if (!inQueue) return null;

  return (
    <div className="active-queue-banner">
      <div className="aqb-left">
        <div className="aqb-pulse">⏳</div>
        <div>
          <div className="aqb-title">Registrar Office</div>
          <div className="aqb-sub">We'll notify you when it's your turn</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="aqb-pos">#4</div>
        <div className="aqb-pos-lbl">Your position</div>
      </div>
      <button className="btn-leave" onClick={() => setInQueue(false)}>Leave</button>
    </div>
  );
};
