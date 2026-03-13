let currentUser  = null;
let myQueueEntry = null;
let realtimeSub  = null;
let demoQueueInterval = null;
let queueSimulationInterval = null;
let unreadCount = 1;
let notifications = [
  { id: 1, title: 'Welcome to Campus Queue', msg: 'You can join queues in real-time!', icon: '👋', time: new Date() }
];

async function goHome() {
  showPage('home');

  const meta = currentUser?.user_metadata;
  const name = meta?.full_name || currentUser?.email?.split('@')[0] || 'Student';
  document.getElementById('user-name').textContent   = name;
  document.getElementById('user-avatar').textContent = name[0].toUpperCase();

  await loadServices();
  await checkMyQueue();
  subscribeToUpdates();
  
  if (!isConfigured) {
    startQueueSimulation();
  }
}

async function loadServices() {
  let services = DEMO_SERVICES;

  if (isConfigured && initSupabase()) {
    const { data, error } = await sb
        .from('services')
        .select('*')
        .eq('is_open', true)
        .order('name');

    if (error) {
      console.error('Error loading services:', error.message);
    } else {
      services = data;
    }
  }

  renderCards(services);
}

function renderCards(services) {
  const grid = document.getElementById('services-grid');
  grid.innerHTML = '';

  services.forEach(svc => {
    const waitClass = svc.wait_time_min <= 10 ? 'ok'
        : svc.wait_time_min <= 20 ? 'warn'
            : 'bad';

    const isMyQueue = myQueueEntry?.service_id === svc.id;

    const card = document.createElement('div');
    card.className = 'svc-card' + (isMyQueue ? ' in-queue' : '');
    card.style.setProperty('--ca', svc.accent_color || '#6c63ff');
    card.dataset.serviceId = svc.id;

    card.innerHTML = `
      <div class="my-queue-tag">In queue #${myQueueEntry?.position || ''}</div>
      <div class="sc-top">
        <div>
          <div class="sc-name">${svc.name}</div>
          <div class="sc-live">${svc.is_open ? 'Open now' : 'Closed'}</div>
        </div>
        <div class="sc-badge">${svc.icon}</div>
      </div>
      <div class="sc-metrics">
        <div class="sc-metric">
          <span class="sc-metric-icon">⏱</span>
          <div>
            <div class="sc-val ${waitClass}">${svc.wait_time_min} min</div>
            <div class="sc-lbl">Wait Time</div>
          </div>
        </div>
        <div class="sc-metric">
          <span class="sc-metric-icon">👥</span>
          <div>
            <div class="sc-val">${svc.queue_count}</div>
            <div class="sc-lbl">In Queue</div>
          </div>
        </div>
      </div>
      <button class="btn-join"
        onclick="joinQueue(${svc.id}, '${svc.name}', ${svc.wait_time_min})"
        ${isMyQueue ? 'disabled' : ''}>
        ${isMyQueue ? '✓ Joined' : '→ Join Queue'}
      </button>
    `;

    grid.appendChild(card);
  });
}

async function joinQueue(serviceId, serviceName, waitTime) {
  if (myQueueEntry) {
    showToast('Leave your current queue first', '⚠️', 'Already in a queue');
    return;
  }

  if (!isConfigured || !initSupabase()) {
    myQueueEntry = {
      service_id: serviceId,
      position: Math.floor(Math.random() * 5) + 3,
      status: 'waiting'
    };
    updateQueueBanner(serviceName);
    renderCards(DEMO_SERVICES);
    showToast(`Position #${myQueueEntry.position} — ~${waitTime} min`, '✅', `Joined ${serviceName}`);
    
    // Simulate real-time queue position updates
    clearInterval(demoQueueInterval);
    demoQueueInterval = setInterval(() => {
      if (!myQueueEntry || myQueueEntry.status !== 'waiting') {
        clearInterval(demoQueueInterval);
        return;
      }
      
      myQueueEntry.position--;
      updateQueueBanner(serviceName);
      
      if (myQueueEntry.position === 1) {
        clearInterval(demoQueueInterval);
        setTimeout(() => {
          if (myQueueEntry) {
            myQueueEntry.status = 'called';
            showToast("It's your turn! Head to the office now.", '🔔', "You're up!");
            addNotification("You're up!", "It's your turn! Head to the office now.", '🔔');
          }
        }, 3000);
      }
    }, 4000);
    
    return;
  }

  const { count } = await sb
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId)
      .eq('status', 'waiting');

  const position = (count || 0) + 1;

  const { data, error } = await sb
      .from('queue_entries')
      .insert({
        user_id:    currentUser.id,
        service_id: serviceId,
        position,
        status:     'waiting'
      })
      .select()
      .single();

  if (error) {
    showToast(error.message, '❌', 'Error joining queue');
    return;
  }

  myQueueEntry = data;
  updateQueueBanner(serviceName);
  await loadServices();
  showToast(`Position #${position} — ~${waitTime} min wait`, '✅', `Joined ${serviceName}`);
}

async function leaveQueue() {
  if (!myQueueEntry) return;

  clearInterval(demoQueueInterval);

  if (isConfigured && initSupabase()) {
    const { error } = await sb
        .from('queue_entries')
        .update({ status: 'cancelled' })
        .eq('id', myQueueEntry.id);

    if (error) {
      showToast(error.message, '❌', 'Error leaving queue');
      return;
    }
  }

  myQueueEntry = null;
  document.getElementById('aqb').classList.remove('show');
  await loadServices();
  showToast('You have left the queue', 'ℹ️', 'Queue left');
}

async function checkMyQueue() {
  if (!isConfigured || !initSupabase() || !currentUser) return;

  const { data } = await sb
      .from('queue_entries')
      .select('*, services(name)')
      .eq('user_id', currentUser.id)
      .eq('status', 'waiting')
      .single();

  if (data) {
    myQueueEntry = data;
    updateQueueBanner(data.services?.name || 'Service');
  }
}

function subscribeToUpdates() {
  if (!isConfigured || !initSupabase() || realtimeSub) return;

  realtimeSub = sb
      .channel('services-realtime')
      .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'services' },
          () => { loadServices(); }
      )
      .subscribe();

  sb.channel('my-queue-realtime')
      .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'queue_entries',
            filter: `user_id=eq.${currentUser?.id}`
          },
          (payload) => {
            if (payload.new.status === 'called') {
              showToast("It's your turn! Head to the office now.", '🔔', "You're up!");
            }
            myQueueEntry = payload.new;
            const pos = document.getElementById('aqb-pos');
            if (pos) pos.textContent = `#${payload.new.position}`;
          }
      )
      .subscribe();
}

function startQueueSimulation() {
  if (queueSimulationInterval) clearInterval(queueSimulationInterval);
  
  queueSimulationInterval = setInterval(() => {
    let changed = false;
    
    DEMO_SERVICES.forEach(svc => {
      // 20% chance to change per tick
      if (Math.random() < 0.2) {
        changed = true;
        
        // Randomly go up or down by 1-2
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1 
        
        // Bias slightly towards keeping the queue reasonable (1-20 range mostly)
        if (svc.queue_count > 15 && change > 0) return;
        if (svc.queue_count < 2 && change < 0) return;
        
        svc.queue_count += change;
        
        // Adjust wait time based on queue length loosely
        const waitPerPerson = Math.max(2, Math.floor(svc.wait_time_min / Math.max(1, svc.queue_count)));
        svc.wait_time_min += (change * waitPerPerson);
        if (svc.wait_time_min < 2) svc.wait_time_min = 2;
      }
    });

    if (changed) {
      renderCards(DEMO_SERVICES);
    }
  }, 4000);
}

function updateQueueBanner(serviceName) {
  document.getElementById('aqb-service').textContent = `In queue: ${serviceName}`;
  document.getElementById('aqb-pos').textContent = `#${myQueueEntry?.position || '?'}`;
  document.getElementById('aqb').classList.add('show');
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function showProfile() {
  showPage('profile');
  loadProfileData();
}

function loadProfileData() {
  if (!currentUser) return;
  const meta = currentUser.user_metadata;
  const name = meta?.full_name || currentUser.email?.split('@')[0] || 'User';
  
  document.getElementById('prof-avatar').textContent = name.substring(0, 2).toUpperCase();
  document.getElementById('prof-name').textContent = name;
  document.getElementById('prof-email').textContent = currentUser.email;
  
  // Simulated stats
  document.getElementById('prof-sid').textContent = 'Student ID: 2024-' + (Math.floor(Math.random() * 89999) + 10000);
  document.getElementById('prof-queues').textContent = Math.floor(Math.random() * 50) + 5;
  
  // Set values in edit inputs
  document.getElementById('edit-name').value = name;
  document.getElementById('edit-email').value = currentUser.email;
  document.getElementById('edit-password').value = '';
}

function toggleEditProfile() {
  const viewMode = document.getElementById('prof-view-mode');
  const editMode = document.getElementById('prof-edit-mode');
  
  if (viewMode.style.display === 'none') {
    viewMode.style.display = 'block';
    editMode.style.display = 'none';
  } else {
    viewMode.style.display = 'none';
    editMode.style.display = 'block';
  }
}

function saveProfileData() {
  const newName = document.getElementById('edit-name').value.trim();
  const newPassword = document.getElementById('edit-password').value;
  
  if (!newName) {
    showToast('Name cannot be empty', '❌', 'Error');
    return;
  }
  
  if (!isConfigured) {
    // Local storage update for demo mode
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
    if (demoUsers[currentUser.email]) {
      demoUsers[currentUser.email].name = newName;
      if (newPassword) {
        demoUsers[currentUser.email].password = newPassword;
      }
      localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
    }
    
    // Update current user
    if (!currentUser.user_metadata) currentUser.user_metadata = {};
    currentUser.user_metadata.full_name = newName;
    
    showToast('Profile updated successfully', '✅', 'Saved');
    toggleEditProfile();
    loadProfileData();
    
    // Update home page avatar
    document.getElementById('user-name').textContent = newName;
    document.getElementById('user-avatar').textContent = newName[0].toUpperCase();
    return;
  }
  
  // TODO: Implement Supabase profile update
  showToast('Profile updated', '✅', 'Saved');
  toggleEditProfile();
}

let toastTimer;
function showToast(msg, icon = '✅', title = 'Done') {
  document.getElementById('t-icon').textContent  = icon;
  document.getElementById('t-title').textContent = title;
  document.getElementById('t-msg').textContent   = msg;
  const el = document.getElementById('toast');
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}

function addNotification(title, msg, icon) {
  notifications.unshift({
    id: Date.now(),
    title,
    msg,
    icon,
    time: new Date()
  });
  unreadCount++;
  updateNotifBadge();
  if (document.getElementById('notif-dropdown').classList.contains('show')) {
    renderNotifications();
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notif-dropdown');
  dropdown.classList.toggle('show');
  if (dropdown.classList.contains('show')) {
    unreadCount = 0;
    updateNotifBadge();
    renderNotifications();
  }
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (notifications.length === 0) {
    list.innerHTML = `<div class="nd-empty">No new notifications</div>`;
    return;
  }
  
  list.innerHTML = notifications.map(n => `
    <div class="nd-item">
      <div class="nd-item-ico">${n.icon}</div>
      <div class="nd-item-content">
        <div class="nd-item-title">${n.title}</div>
        <div class="nd-item-desc">${n.msg}</div>
      </div>
    </div>
  `).join('');
}

function clearNotifications() {
  notifications = [];
  unreadCount = 0;
  updateNotifBadge();
  renderNotifications();
}

function updateNotifBadge() {
  const badge1 = document.getElementById('home-notif-badge');
  const badge2 = document.getElementById('prof-notif-badge');
  
  if (badge1) {
    badge1.textContent = unreadCount;
    badge1.style.display = unreadCount > 0 ? 'grid' : 'none';
  }
  if (badge2) {
    badge2.textContent = unreadCount;
    badge2.style.display = unreadCount > 0 ? 'grid' : 'none';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown && dropdown.classList.contains('show')) {
    const isClickInside = dropdown.contains(e.target) || e.target.closest('.nav-ico-btn');
    if (!isClickInside) {
      dropdown.classList.remove('show');
    }
  }
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  checkSession();
  updateNotifBadge();
});