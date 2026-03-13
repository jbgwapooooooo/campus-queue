const SUPABASE_URL = 'https://zitesenppfnjfhsyawop.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdGVzZW5wcGZuamZoc3lhd29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDU1NTEsImV4cCI6MjA4ODk4MTU1MX0.LoCn8otwgv0rPS8I4kXG2EeF2-Mx9PDblJ6kjXVBWzg';

const isConfigured = !SUPABASE_URL.includes('YOUR_') && SUPABASE_URL.includes('.supabase.co');

let sb = null;

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('Supabase SDK not loaded yet');
    return false;
  }
  if (!isConfigured) {
    return false;
  }
  if (!sb) {
    try {
      sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase client ready');
    } catch (error) {
      console.error('Supabase initialization failed. Check your URL/Key.', error);
      return false;
    }
  }
  return true;
}

const DEMO_SERVICES = [
  { id: 1, name: 'Registrar Office', icon: '📋', wait_time_min: 15, queue_count: 8,  is_open: true, accent_color: '#6c63ff' },
  { id: 2, name: 'Financial Aid',    icon: '💰', wait_time_min: 25, queue_count: 12, is_open: true, accent_color: '#f5a623' },
  { id: 3, name: 'Cashier',          icon: '🧾', wait_time_min: 10, queue_count: 5,  is_open: true, accent_color: '#2dd4a0' },
  { id: 4, name: 'Library Services', icon: '📚', wait_time_min: 5,  queue_count: 3,  is_open: true, accent_color: '#38bdf8' },
  { id: 5, name: 'IT Help Desk',     icon: '💻', wait_time_min: 20, queue_count: 9,  is_open: true, accent_color: '#ff6b6b' },
  { id: 6, name: 'Student Affairs',  icon: '🎓', wait_time_min: 30, queue_count: 15, is_open: true, accent_color: '#c084fc' },
];