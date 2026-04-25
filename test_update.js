const url = 'https://toayrzzqhnspxhkaljwm.supabase.co/rest/v1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYXlyenpxaG5zcHhoa2FsandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyNzcsImV4cCI6MjA4Njc0MDI3N30.ge6vTfuhwr2zwDLPtff3slwygVFdhltWWOonqt-s9Do';

async function testUpdate() {
    const res = await fetch(`${url}/queue_entries?select=*&limit=1`, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } });
    const data = await res.json();
    console.log("Got entry:", data);
    
    if (data.length > 0) {
        const id = data[0].id;
        const upRes = await fetch(`${url}/queue_entries?id=eq.${id}`, { 
            method: 'PATCH',
            headers: { 
                'apikey': key, 
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ status: 'resolved' })
        });
        console.log("Update res:", upRes.status, await upRes.text());
    }
}

testUpdate().catch(console.error);
