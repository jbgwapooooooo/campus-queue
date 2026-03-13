let currentUser  = null;
let myQueueEntry = null;
let realtimeSub  = null;

async function goHome() {
  showPage('home');

  const meta = currentUser?.user_metadata;
  const name = meta?.full_name || currentUser?.email?.split('@')[0] || 'Student';
  document.getElementById('user-name').textContent   = name;
  document.getElementById('user-avatar').textContent = name[0].toUpperCase();

  await loadServices();
  await checkMyQueue();
  subscribeToUpdates();
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
      position: Math.floor(Math.random() * 10) + 1
    };
    updateQueueBanner(serviceName);
    renderCards(DEMO_SERVICES);
    showToast(`Position #${myQueueEntry.position} — ~${waitTime} min`, '✅', `Joined ${serviceName}`);
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  checkSession();
});