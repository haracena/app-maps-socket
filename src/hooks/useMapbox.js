import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken =
  'pk.eyJ1IjoiaGFyYWNlbmEiLCJhIjoiY2trNWp5NjZvMW8ydjJ5cGp5dTRxNWdraSJ9.IdRdtcsMn2mgq-qF4B9a4w';

const useMapbox = (puntoInicial) => {
  const mapaDiv = useRef();
  const setRef = useCallback((node) => {
    mapaDiv.current = node;
  }, []);

  const marcadores = useRef({});

  const movimientoMarcador = useRef(new Subject());
  const nuevoMarcador = useRef(new Subject());

  const mapa = useRef();
  const [coords, setCoords] = useState(puntoInicial);

  const agregarMarcador = useCallback((e, id) => {
    const { lng, lat } = e.lngLat || e;
    const marker = new mapboxgl.Marker();

    marker.id = id ?? v4();
    marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(true);
    marcadores.current[marker.id] = marker;
    // escuchar movimientos del marker

    if (!id) {
      nuevoMarcador.current.next({
        id: marker.id,
        lng,
        lat,
      });
    }

    marker.on('drag', ({ target }) => {
      const { id } = target;
      const { lng, lat } = target.getLngLat();
      movimientoMarcador.current.next({
        id,
        lng,
        lat,
      });
    });
  }, []);

  // funcion para actualizar la ubicación del marcador
  const actualizarMarcador = useCallback(({ id, lng, lat }) => {
    marcadores.current[id].setLngLat([lng, lat]);
  });

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [puntoInicial.lng, puntoInicial.lat],
      zoom: puntoInicial.zoom,
    });

    mapa.current = map;
  }, [puntoInicial]);

  // Cuando se mueve el mapa
  useEffect(() => {
    mapa.current?.on('move', () => {
      const { lng, lat } = mapa.current.getCenter();
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapa.current.getZoom().toFixed(2),
      });
    });
  }, []);

  // Agregar marcadores cuando hacemos click
  useEffect(() => {
    mapa.current?.on('click', (e) => {
      agregarMarcador(e);
    });
  }, [agregarMarcador]);

  return {
    coords,
    marcadores,
    setRef,
    agregarMarcador,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    actualizarMarcador,
  };
};

export default useMapbox;
