import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ClassPage from './pages/ClassPage.jsx';
import NotFound from './pages/NotFound.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Login/> },
  { path: '/signup', element: <Signup/> },
  { path: '/dashboard', element: <Dashboard/> },
  { path: '/class/:className', element: <ClassPage/> },
  { path: '*', element: <NotFound/> }
]);

export default function AppRouter(){ return <RouterProvider router={router}/>; }
