import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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
