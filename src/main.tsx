import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import PortalProvider from './components/PortalProvider';
import './styles/theme.css';
import './styles/app.css';
import './styles/district.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PortalProvider>
        <App />
      </PortalProvider>
    </BrowserRouter>
  </StrictMode>,
);
import './styles/refinement.css';

import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './styles/regional.css';

import './styles/premium.css';
import './styles/master-layout.css';
import './styles/analytics.css';

import './styles/hardening.css';

import './styles/citizen-tools.css';
import './styles/navigation.css';
import './styles/regional-changes.css';
