import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Habilita os reveals de seção (o CSS só esconde com esta classe).
document.documentElement.classList.add('js-reveal');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// O pôster estático do index.html já cumpriu o papel (primeira pintura/LCP).
window.addEventListener('load', () => document.querySelector('.boot-poster')?.remove(), { once: true });
