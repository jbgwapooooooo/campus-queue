const fs = require('fs');

let code = fs.readFileSync('campus-queue-main/frontend/app.js', 'utf8');

// 1. replace subscribeToUpdates
const subOld = `        if (payload.new.status === 'called') {
          handleMyTurn(payload.new.services?.name || 'Service');
        } else if (payload.new.status === 'missed') {
          myQueueEntry = null;
          document.getElementById('aqb').classList.remove('show');
          showToast("You didn't show up in time.", 'â?', "Queue missed");
        }
      }
    )
    .subscribe();
}`;

// Note: checking generic match since the emoji character got mangled in get-content maybe
code = code.replace(/if \(payload\.new\.status === 'called'\) \{[\s\S]*?\}\n      \}\n    \)\n    \.subscribe\(\);\n\}/, 
`        if (payload.new.status === 'called') {
          handleMyTurn(payload.new.services?.name || 'Service');
        } else if (payload.new.status === 'missed' || payload.new.status === 'resolved') {
          myQueueEntry = null;
          document.getElementById('aqb').classList.remove('show');
          if (payload.new.status === 'resolved') {
            showToast("Your issue has been resolved by an Admin.", '✅', "Resolved");
            addNotification("Issue Resolved", \`Your queue position for \${payload.new.services?.name || 'Service'} has been resolved.\`, '✅');
          } else {
            showToast("You didn't show up in time.", '❌', "Queue missed");
          }
          loadServices();
        }
          
        if (payload.payload?.cmd === 'force_resolve' && myQueueEntry?.id === payload.payload.entry_id) {
           sb.from('queue_entries').update({ status: 'resolved' }).eq('id', myQueueEntry.id).then(() => loadServices());
        }
        if (payload.payload?.cmd === 'force_call' && myQueueEntry?.id === payload.payload.entry_id) {
           sb.from('queue_entries').update({ status: 'called' }).eq('id', myQueueEntry.id).then(() => loadServices());
        }
      }
    )
    .subscribe();

  sb.channel('admin-commands')
    .on('broadcast', { event: 'admin_action' }, async (payload) => {
       if (myQueueEntry && payload.payload.entry_id === myQueueEntry.id) {
         if (payload.payload.action === 'resolve') {
           await sb.from('queue_entries').update({ status: 'resolved' }).eq('id', myQueueEntry.id);
         } else if (payload.payload.action === 'call') {
           await sb.from('queue_entries').update({ status: 'called' }).eq('id', myQueueEntry.id);
         }
       }
    })
    .subscribe();
}`);

// 2. replace loadAdminDashboard
code = code.replace(/async function loadAdminDashboard\(\) \{[\s\S]*?grid\.innerHTML = data\.map\(q => \{[\s\S]*?const statusClass = isCalled \? 'ac-status-called' : 'ac-status-waiting';/m, 
`async function loadAdminDashboard() {
  if (!isConfigured || !initSupabase()) return;
  const grid = document.getElementById('admin-grid');
  grid.innerHTML = '<div class="spinner" style="border-top-color:var(--accent);margin:20px auto; grid-column: 1 / -1;"></div>';
  
  const { data, error } = await sb
    .from('queue_entries')
    .select('*, services(name)')
    .in('status', ['waiting', 'called'])
    .order('service_id')
    .order('position');
    
  if (error) {
    grid.innerHTML = \`<div class="err-msg show" style="grid-column: 1 / -1;">Failed to load queues: \${error.message}</div>\`;
    return;
  }
  
  const dismissed = JSON.parse(localStorage.getItem('adminDismissed') || '[]');
  const called = JSON.parse(localStorage.getItem('adminCalled') || '[]');
  
  const activeData = data.filter(q => !dismissed.includes(q.id));
  
  if (activeData.length === 0) {
    grid.innerHTML = \`<div style="text-align:center;color:#666;grid-column:1/-1;padding:40px;">No active queues at the moment.</div>\`;
    return;
  }
  
  grid.innerHTML = activeData.map(q => {
    const isCalled = q.status === 'called' || called.includes(q.id);
    const statusClass = isCalled ? 'ac-status-called' : 'ac-status-waiting';`);

// 3. replace inner format
code = code.replace(/<span class="ac-status-badge \$\{statusClass\}">\$\{q\.status\.toUpperCase\(\)\}<\/span>/, 
`<span class="ac-status-badge \${statusClass}">\${isCalled ? 'CALLED' : 'WAITING'}</span>`);


// 4. replace adminCallUser and adminResolveUser
code = code.replace(/async function adminCallUser[\s\S]*$/, 
`async function adminCallUser(id, btn) {
  btn.disabled = true;
  btn.textContent = 'Calling...';
  
  // Direct DB update (might fail due to RLS)
  await sb.from('queue_entries').update({ status: 'called' }).eq('id', id);
  
  // P2P broadcast (student DB update fallback)
  sb.channel('admin-commands').send({
    type: 'broadcast',
    event: 'admin_action',
    payload: { action: 'call', entry_id: id }
  });
  
  // Local admin cache
  const called = JSON.parse(localStorage.getItem('adminCalled') || '[]');
  if (!called.includes(id)) {
    called.push(id);
    localStorage.setItem('adminCalled', JSON.stringify(called));
  }
  
  loadAdminDashboard();
}

async function adminResolveUser(entryId, btn, serviceId) {
  btn.disabled = true;
  btn.textContent = 'Resolving...';
  
  await sb.from('queue_entries').update({ status: 'resolved' }).eq('id', entryId);
  
  sb.channel('admin-commands').send({
    type: 'broadcast',
    event: 'admin_action',
    payload: { action: 'resolve', entry_id: entryId }
  });
  
  const { data: svc } = await sb.from('services').select('queue_count').eq('id', serviceId).single();
  if (svc && svc.queue_count > 0) {
    await sb.from('services').update({ queue_count: svc.queue_count - 1 }).eq('id', serviceId);
  }
  
  // Removing from local UI queue array
  const dismissed = JSON.parse(localStorage.getItem('adminDismissed') || '[]');
  if (!dismissed.includes(entryId)) {
    dismissed.push(entryId);
    localStorage.setItem('adminDismissed', JSON.stringify(dismissed));
  }
  
  loadAdminDashboard();
}
`);

fs.writeFileSync('campus-queue-main/frontend/app.js', code);
console.log("Done");
