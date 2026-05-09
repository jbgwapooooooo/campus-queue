const url = 'https://toayrzzqhnspxhkaljwm.supabase.co/rest/v1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYXlyenpxaG5zcHhoa2FsandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyNzcsImV4cCI6MjA4Njc0MDI3N30.ge6vTfuhwr2zwDLPtff3slwygVFdhltWWOonqt-s9Do';

async function createAdmin() {
    const authRes = await fetch('https://toayrzzqhnspxhkaljwm.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: 'admin@cit.edu', 
            password: 'admin123',
            data: { 
                full_name: 'System Administrator',
                role: 'admin'
            }
        })
    });
    const authData = await authRes.json();
    console.log("Create admin response:", authData);
}

createAdmin().catch(console.error);
