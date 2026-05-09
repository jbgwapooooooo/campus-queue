const url = 'https://toayrzzqhnspxhkaljwm.supabase.co/rest/v1/services';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYXlyenpxaG5zcHhoa2FsandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyNzcsImV4cCI6MjA4Njc0MDI3N30.ge6vTfuhwr2zwDLPtff3slwygVFdhltWWOonqt-s9Do';

async function list() {
    const res = await fetch(url + '?select=*', {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const services = await res.json();
    console.log("Database has", services.length, "services:");
    services.forEach(s => console.log(s.id, s.name));
}

list().catch(console.error);
