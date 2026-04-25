const url = 'https://toayrzzqhnspxhkaljwm.supabase.co/rest/v1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYXlyenpxaG5zcHhoa2FsandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyNzcsImV4cCI6MjA4Njc0MDI3N30.ge6vTfuhwr2zwDLPtff3slwygVFdhltWWOonqt-s9Do';

async function authAndTest() {
    // 1. Auth as demouser
    const authRes = await fetch('https://toayrzzqhnspxhkaljwm.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '123@cit.edu', password: 'password123' })
    });
    const authData = await authRes.json();
    if (authData.error) return console.error("Auth failed:", authData.error);
    
    const token = authData.access_token;
    
    // 2. Fetch queue entries
    const qRes = await fetch(`${url}/queue_entries?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${token}` }
    });
    const entries = await qRes.json();
    console.log("Entries visible to test user:", entries);

    // 3. Try deleting one if it exists
    if (entries.length > 0) {
        const delRes = await fetch(`${url}/queue_entries?id=eq.${entries[0].id}`, {
            method: 'DELETE',
            headers: { 'apikey': key, 'Authorization': `Bearer ${token}`, 'Prefer': 'return=representation' }
        });
        console.log("Delete response:", delRes.status, await delRes.text());
        
        // 4. Try updating
        const upRes = await fetch(`${url}/queue_entries?id=eq.${entries[0].id}`, {
            method: 'PATCH',
            headers: { 'apikey': key, 'Authorization': `Bearer ${token}`, 'Prefer': 'return=representation', 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'resolved' })
        });
        console.log("Update to resolved response:", upRes.status, await upRes.text());
        
        // 4b. Try updating to missed
        const upRes2 = await fetch(`${url}/queue_entries?id=eq.${entries[0].id}`, {
            method: 'PATCH',
            headers: { 'apikey': key, 'Authorization': `Bearer ${token}`, 'Prefer': 'return=representation', 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'missed' })
        });
        console.log("Update to missed response:", upRes2.status, await upRes2.text());
    }
}

authAndTest().catch(console.error);
