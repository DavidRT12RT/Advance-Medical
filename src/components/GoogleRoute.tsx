import React, { useRef, useEffect, useState, memo } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries: any[] = ['places'];

const MapWithRoute = React.memo(({ pointA, pointB, setDistance, setDuration }: any) => {
  const mapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  /* const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState(''); */

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk', // Reemplaza con tu API key de Google Maps
    libraries,
  });

  useEffect(() => {
    if (isLoaded && pointA && pointB) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: pointA,
        zoom: 10,
      });

      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
      directionsRendererRef.current.setMap(map);

      const request = {
        origin: pointA,
        destination: pointB,
        travelMode: window.google.maps.TravelMode.DRIVING, // Puedes cambiar a WALKING, BICYCLING, TRANSIT
      };

      directionsServiceRef.current.route(request, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);
          const route = result.routes[0].legs[0];
          setDistance(route.distance.text.toUpperCase());
          setDuration(route.duration.text.toUpperCase());
        } else {
          console.error(`Error fetching directions ${status}`);
        }
      });
    }
  }, [isLoaded, pointA, pointB]);

  return (
    <div>
      {!isLoaded ? (
        <p>Cargando...</p>
      ) : (
        <div ref={mapRef} style={{ height: '50vh', width: '100%' }} />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.pointA?.lat === nextProps.pointA?.lat &&
    prevProps.pointA?.lng === nextProps.pointA?.lng &&
    prevProps.pointB?.lat === nextProps.pointB?.lat &&
    prevProps.pointB?.lng === nextProps.pointB?.lng
  );
});

export default MapWithRoute;
