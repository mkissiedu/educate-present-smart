import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://bdiqvamaufgdvkjozenl.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJjNzE3NDMyLWM5N2EtNGY4Yy1hZmMzLWFkNzMyNGRiYWYwOCJ9.eyJwcm9qZWN0SWQiOiJiZGlxdmFtYXVmZ2R2a2pvemVubCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY0MzUzODcwLCJleHAiOjIwNzk3MTM4NzAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.KPYo8wDpX1vpVIMjKDtRu6zD6KkSg2p9rMtMyJLNv5U';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
  },
  // Disable automatic Realtime connection to prevent websocket decode errors
  // when the Realtime server isn't fully configured for this project
  global: {
    headers: {
      'x-client-info': 'supabase-js-web/2.99.1',
    },
  },
});

// Disconnect Realtime on init to prevent the "n is not iterable" binary decode error
// that occurs when the Realtime websocket receives malformed binary messages.
// Components that need Realtime can explicitly reconnect with proper error handling.
try {
  supabase.realtime.disconnect();
} catch (e) {
  // Silently ignore if disconnect fails
}

export { supabase };
