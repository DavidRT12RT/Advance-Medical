import React, { useRef, useEffect, useState, memo } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Typography } from 'antd';

const { Text } = Typography;
const libraries: any[] = ['places'];

interface Destination {
  lat: number;
  lng: number;
  label?: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  arrivalTime: string;
}

interface Props {
  startPoint: Destination;
  destinations: Destination[];
  onRouteCalculated?: (routeInfo: RouteInfo[]) => void;
}

const MultipleDestinationsMap = memo(({ startPoint, destinations, onRouteCalculated }: Props) => {
  const mapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo[]>([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk',
    libraries,
  });

  const calculateRoute = async () => {
    if (!directionsServiceRef.current || destinations.length === 0) return;

    let currentTime = new Date();
    let accumulatedDuration = 0;
    const waypoints = destinations.slice(0, -1).map(dest => ({
      location: new window.google.maps.LatLng(dest.lat, dest.lng),
      stopover: true
    }));

    const request = {
      origin: new window.google.maps.LatLng(startPoint.lat, startPoint.lng),
      destination: new window.google.maps.LatLng(
        destinations[destinations.length - 1].lat,
        destinations[destinations.length - 1].lng
      ),
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    try {
      const result: any = await new Promise((resolve, reject) => {
        directionsServiceRef.current.route(request, (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            reject(new Error(`Error fetching directions ${status}`));
          }
        });
      });

      directionsRendererRef.current.setDirections(result);
      const routes = result.routes[0].legs;
      console.log('routes', routes);
      const newRouteInfo = routes.map((leg: any, index: number) => {
        accumulatedDuration += leg.duration.value;
        const arrivalTime = new Date(currentTime.getTime() + (accumulatedDuration * 1000));

        return {
          distance: leg.distance.text.toUpperCase(),
          duration: leg.duration.text.toUpperCase(),
          arrivalTime: arrivalTime.toLocaleTimeString(),
        };
      });

      setRouteInfo(newRouteInfo);
      if (onRouteCalculated) {
        onRouteCalculated(newRouteInfo);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && startPoint && destinations.length > 0) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: startPoint,
        zoom: 10,
      });

      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
      });

      calculateRoute();
    }
  }, [isLoaded, startPoint, destinations]);

  return (
    <div>
      {!isLoaded ? (
        <Text>Cargando...</Text>
      ) : (
        <>
          <div ref={mapRef} style={{ height: '50vh', width: '100%', marginBottom: '20px' }} />
          {/* <div>
            {routeInfo.map((info, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <Text strong>Destino {index + 1}:</Text>
                <br />
                <Text>Distancia: {info.distance}</Text>
                <br />
                <Text>Duración: {info.duration}</Text>
                <br />
                <Text>Hora estimada de llegada: {info.arrivalTime}</Text>
              </div>
            ))}
          </div> */}
        </>
      )}
    </div>
  );
});

export default MultipleDestinationsMap;
