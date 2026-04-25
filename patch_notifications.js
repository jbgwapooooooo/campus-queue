const fs = require('fs');
let code = fs.readFileSync('campus-queue-main/frontend/app.js', 'utf8');

// 1. Request Notification Perm on Join Queue
code = code.replace(/async function joinQueue\(serviceId, svcName\) \{/g, 
`async function joinQueue(serviceId, svcName) {
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }`);

// 2. Add Desktop Notification and Banner Update to handleMyTurn
const oldHandleMyTurn = `function handleMyTurn(svcName) {
  showToast("It's your turn! Head to the office now! You have 20 seconds.", '🔔', "You're up!");
  addNotification("You're up!", "It's your turn! Head to the office now.", '🔔');`;

const newHandleMyTurn = `function handleMyTurn(svcName) {
  showToast("It's your turn! Head to the office now! You have 20 seconds.", '🔔', "You're up!");
  addNotification("You're up!", "It's your turn! Head to the office now.", '🔔');
  
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Campus Queue: Your Turn!", {
      body: \`Please approach the \${svcName} counter immediately.\`,
      icon: 'favicon.ico'
    });
  }
  
  const aqb = document.getElementById('aqb');
  if (aqb) {
    aqb.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    aqb.style.animation = 'pulse 1s infinite alternate';
    const sub = aqb.querySelector('.aqb-sub');
    if (sub) sub.textContent = "IT IS YOUR TURN! Please approach the counter!";
    const posLbl = aqb.querySelector('.aqb-pos-lbl');
    if (posLbl) posLbl.textContent = "GO NOW";
  }`;

// Note: Using generic emoji matching placeholder since emojis can cause mismatch
code = code.replace(/function handleMyTurn\(svcName\) \{[\s\S]*?addNotification\("You're up!", "It's your turn! Head to the office now.", '.*?'\);/, newHandleMyTurn);

// 3. Reset Banner Style on Join or Reset
const oldShowBanner = `  const aqb = document.getElementById('aqb');
  if (aqb) {
    document.getElementById('aqb-service').textContent = myQueueEntry.services?.name || 'Service Queue';
    document.getElementById('aqb-pos').textContent = \`#\${myQueueEntry.position}\`;
    aqb.classList.add('show');
  }`;

const newShowBanner = `  const aqb = document.getElementById('aqb');
  if (aqb) {
    aqb.style.background = 'white';
    aqb.style.animation = 'none';
    const sub = aqb.querySelector('.aqb-sub');
    if (sub) sub.textContent = "We'll notify you when it's your turn";
    const posLbl = aqb.querySelector('.aqb-pos-lbl');
    if (posLbl) posLbl.textContent = "Your position";

    document.getElementById('aqb-service').textContent = myQueueEntry.services?.name || 'Service Queue';
    document.getElementById('aqb-pos').textContent = \`#\${myQueueEntry.position}\`;
    aqb.classList.add('show');
  }`;

code = code.replace(/  const aqb = document\.getElementById\('aqb'\);\n  if \(aqb\) \{\n    document\.getElementById\('aqb-service'\)\.textContent = myQueueEntry\.services\?\.name \|\| 'Service Queue';\n    document\.getElementById\('aqb-pos'\)\.textContent = `#\$\{myQueueEntry\.position\}`;\n    aqb\.classList\.add\('show'\);\n  \}/, newShowBanner);

fs.writeFileSync('campus-queue-main/frontend/app.js', code);
console.log("Notifications Patched");
