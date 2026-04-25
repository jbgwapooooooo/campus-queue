const fs = require('fs');
let code = fs.readFileSync('campus-queue-main/frontend/app.js', 'utf8');

// Fix missing quotes around UUIDs in onclick handlers
code = code.replace(/onclick="adminCallUser\(\$\{q\.id\}, this\)"/g, `onclick="adminCallUser('\${q.id}', this)"`);
code = code.replace(/onclick="adminResolveUser\(\$\{q\.id\}, this, \$\{q\.service_id\}\)"/g, `onclick="adminResolveUser('\${q.id}', this, \${q.service_id})"`);

fs.writeFileSync('campus-queue-main/frontend/app.js', code);
console.log("App.js patched for UUID quotes");
