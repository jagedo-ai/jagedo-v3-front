import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';


const queryClient = new QueryClient();

// Use a placeholder if GOOGLE_CLIENT_ID is not set to prevent provider from crashing
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-client-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);