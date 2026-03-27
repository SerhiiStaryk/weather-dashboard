import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (
  import.meta.env.DEV &&
  import.meta.env.VITE_OPENWEATHER_API_KEY === 'your_api_key_here'
) {
  // Start MSW browser worker in dev when API key is not configured
  import('./mocks/browser')
    .then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass' }))
    .then(renderApp);
} else {
  renderApp();
}
