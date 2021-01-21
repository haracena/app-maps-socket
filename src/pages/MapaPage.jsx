import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/socketContext';
import useMapbox from '../hooks/useMapbox';

const puntoInicial = {
  lng: -122.47,
  lat: 37.79,
  zoom: 13.6,
};

const MapaPage = () => {
  const {
    coords,
    setRef,
    nuevoMarcador$,
    movimientoMarcador$,
    agregarMarcador,
    actualizarMarcador,
  } = useMapbox(puntoInicial);

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    nuevoMarcador$.subscribe((marcador) => {
      socket.emit('marcador-nuevo', marcador);
    });
  }, [nuevoMarcador$, socket]);

  // Emitir movimiento de marcador
  useEffect(() => {
    movimientoMarcador$.subscribe((marcador) => {
      socket.emit('marcador-actualizado', marcador);
    });
  }, [movimientoMarcador$, socket]);

  // Mover marcador mediante sockets
  useEffect(() => {
    socket.on('marcador-actualizado', (marcador) => {
      actualizarMarcador(marcador);
    });
  }, [socket, actualizarMarcador]);

  // Escuchar marcadores existentes
  useEffect(() => {
    socket.on('marcadores-activos', (marcadores) => {
      for (const key of Object.keys(marcadores)) {
        agregarMarcador(marcadores[key], key);
      }
    });
  }, [socket, agregarMarcador]);

  // Escuchar nuevos marcadores
  useEffect(() => {
    socket.on('marcador-nuevo', (marcador) => {
      agregarMarcador(marcador, marcador.id);
    });
  }, [socket, agregarMarcador]);

  return (
    <>
      <div className='info'>
        Lng: {coords.lng} | Lat: {coords.lat} | Zoom: {coords.zoom}
      </div>
      <div ref={setRef} className='mapContainer'></div>
    </>
  );
};

export default MapaPage;
