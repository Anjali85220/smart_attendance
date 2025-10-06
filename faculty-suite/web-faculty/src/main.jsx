import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router.jsx';
import { Provider } from './store.jsx';
createRoot(document.getElementById('root')).render(<Provider><AppRouter/></Provider>);
