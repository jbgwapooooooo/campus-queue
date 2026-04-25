const url = 'https://toayrzzqhnspxhkaljwm.supabase.co/rest/v1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYXlyenpxaG5zcHhoa2FsandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyNzcsImV4cCI6MjA4Njc0MDI3N30.ge6vTfuhwr2zwDLPtff3slwygVFdhltWWOonqt-s9Do';

async function logSchema() {
    console.log("Services:");
    const resSvc = await fetch(`${url}/services?limit=1`, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } });
    console.log(await resSvc.json());

    console.log("Queue Entries:");
    const resQ = await fetch(`${url}/queue_entries?limit=1`, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } });
    console.log(await resQ.json());
}

logSchema().catch(console.error);
