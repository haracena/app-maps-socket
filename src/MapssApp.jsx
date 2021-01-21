import React from 'react';
import { SocketProvider } from './context/socketContext';
import MapaPage from './pages/MapaPage';

const MapssApp = () => {
  return (
    <SocketProvider>
      <MapaPage />
    </SocketProvider>
  );
};

export default MapssApp;
