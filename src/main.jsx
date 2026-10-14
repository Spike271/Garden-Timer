import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { GardenProvider } from './state/GardenContext';
import { SettingsProvider } from './state/SettingsContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <GardenProvider>
        <App />
      </GardenProvider>
    </SettingsProvider>
  </StrictMode>
);
