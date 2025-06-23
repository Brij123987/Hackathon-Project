import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  // Remove StrictMode to prevent double API calls in development
  <App />
);

// Clean up service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister().then(() => console.log('✅ Service worker unregistered'));
    }
  });
}