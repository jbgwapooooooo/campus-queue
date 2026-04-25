const fs = require('fs');
let code = fs.readFileSync('campus-queue-main/frontend/app.js', 'utf8');

// 1. Inject goHome routing
code = code.replace(/async function goHome\(\) \{\n  showPage\('home'\);/, 
`async function goHome() {
  if (currentUser?.email === 'admin@cit.edu') {
    showPage('admin-panel');
    loadAdminDashboard();
    return;
  }
  showPage('home');`);

// 2. Remove the password prompt function
code = code.replace(/function showAdminPasswordPrompt\(\) \{[\s\S]*?\}\n\n/, '');

// 3. Remove local cache handling from loadAdminDashboard
code = code.replace(/  const dismissed = JSON\.parse.*?;\n  const called = JSON\.parse.*?;\n  \n  const activeData = data\.filter\(q => !dismissed\.includes\(q\.id\)\);\n  \n  if \(activeData\.length === 0\) \{/m, 
`  if (!data || data.length === 0) {`);

code = code.replace(/  grid\.innerHTML = activeData\.map\(q => \{/m, 
`  grid.innerHTML = data.map(q => {`);

code = code.replace(/    const isCalled = q\.status === 'called' \|\| called\.includes\(q\.id\);/m, 
`    const isCalled = q.status === 'called';`);

// 4. Simplify adminCallUser and adminResolveUser
code = code.replace(/async function adminCallUser[\s\S]*$/, 
`async function adminCallUser(id, btn) {
  btn.disabled = true;
  btn.textContent = 'Calling...';
  
  // Direct DB update (with new God Mode RLS)
  const { error } = await sb.from('queue_entries').update({ status: 'called' }).eq('id', id);
  if (!error) loadAdminDashboard();
  else alert('Failed: ' + error.message);
}

async function adminResolveUser(entryId, btn, serviceId) {
  btn.disabled = true;
  btn.textContent = 'Resolving...';
  
  const { error } = await sb.from('queue_entries').update({ status: 'resolved' }).eq('id', entryId);
  if (!error) {
    const { data: svc } = await sb.from('services').select('queue_count').eq('id', serviceId).single();
    if (svc && svc.queue_count > 0) {
      await sb.from('services').update({ queue_count: svc.queue_count - 1 }).eq('id', serviceId);
    }
    loadAdminDashboard();
  } else {
    btn.disabled = false;
    btn.textContent = 'Resolve';
    alert('Failed: ' + error.message);
  }
}
`);

fs.writeFileSync('campus-queue-main/frontend/app.js', code);
console.log("App.js Patched v2");
