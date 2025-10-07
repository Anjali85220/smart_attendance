import React from 'react';
import EnrollForm from './components/EnrollForm';
import CameraTest from './components/CameraTest';

export default function App() {
  const isCameraTest = window.location.search.includes('camera-test');

  return (
    <>
      {isCameraTest ? <CameraTest /> : <EnrollForm />}
    </>
  );
}
