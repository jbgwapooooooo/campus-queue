const url = 'https://toayrzzqhnspxhkaljwm.supabase.co/rest/v1/services';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYXlyenpxaG5zcHhoa2FsandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyNzcsImV4cCI6MjA4Njc0MDI3N30.ge6vTfuhwr2zwDLPtff3slwygVFdhltWWOonqt-s9Do';

async function dedup() {
    console.log("Fetching services...");
    const res = await fetch(url, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const services = await res.json();
    console.log("Got", services.length, "services");

    const seenNames = new Set();
    const toDelete = [];

    for (const svc of services) {
        if (seenNames.has(svc.name)) {
            toDelete.push(svc.id);
        } else {
            seenNames.add(svc.name);
        }
    }

    console.log("Deleting", toDelete.length, "duplicates:", toDelete);

    for (const id of toDelete) {
        const delRes = await fetch(`${url}?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        if (!delRes.ok) {
            console.log("Failed to delete", id, await delRes.text());
        } else {
            console.log("Deleted", id);
        }
    }
    console.log("Done");
}

dedup().catch(console.error);
