/// <reference types="@types/google.maps" />
import React, { useState, useCallback, useRef } from 'react';
import { Libraries, useJsApiLoader } from '@react-google-maps/api';
import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';

const libraries: Libraries = ["drawing", "geometry", "places"];

interface Location {
  lat: number;
  lng: number;
  info?: string;
  nombreProveedor?: string;
  place?: string;
  tipoDireccion?: string;
}

interface RouteInfo {
  order: Location[];
  totalDistance: number;
  totalDuration: number;
  legs: {
    startLocation: Location;
    endLocation: Location;
    distance: number;
    duration: number;
  }[];
}

interface RouteOptimizerProps {
  startPoint?: Location;
  destinations?: Location[];
  onRouteCalculated?: (routeInfo: RouteInfo) => void;
}

// Ejemplo de puntos de entrega para demostración
const EXAMPLE_DESTINATIONS = [
  { lat: 4.6585, lng: -74.0935, nombreProveedor: "Proveedor A", tipoDireccion: "Entrega" },
  { lat: 4.6426, lng: -74.0765, nombreProveedor: "Proveedor B", tipoDireccion: "Entrega" },
  { lat: 4.6741, lng: -74.0505, nombreProveedor: "Proveedor C", tipoDireccion: "Entrega" },
  { lat: 4.6297, lng: -74.0657, nombreProveedor: "Proveedor D", tipoDireccion: "Entrega" },
];

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  startPoint: initialStartPoint,
  destinations: initialDestinations,
  onRouteCalculated
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk",
    libraries
  });

  const [startPoint] = useState<Location>(initialStartPoint || {
    lat: 4.6097100,
    lng: -74.0817500
  });

  const [destinations] = useState<Location[]>(initialDestinations || EXAMPLE_DESTINATIONS);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const optimizeRoute = async (locations: Location[]) => {
    try {
      // Simulated Fleet Engine API optimization request
      // In production, this would be a real API call to Google's Fleet Engine
      const requestBody = {
        origin: startPoint,
        destination: locations[locations.length - 1],
        intermediateLocations: locations.slice(0, -1),
        departureTime: new Date().toISOString(),
        computeAlternativeRoutes: true,
        routingPreference: "TRAFFIC_AWARE",
        languageCode: "es-CO",
        units: "metric"
      };

      // Simulate API response with example routes
      const exampleRoutes = [
        {
          distance: 15200, // 15.2 km
          duration: 2400,  // 40 minutes
          order: locations,
          trafficDelayMinutes: 12,
          fuelUsage: 1.2, // liters
          tollCost: 8500,  // COP
          confidence: 0.95
        },
        {
          distance: 16800, // 16.8 km
          duration: 2700,  // 45 minutes
          order: [...locations].reverse(),
          trafficDelayMinutes: 15,
          fuelUsage: 1.4,
          tollCost: 0,
          confidence: 0.85
        }
      ];

      // Select the best route based on distance and traffic
      const bestRoute = exampleRoutes.reduce((prev, current) => 
        (prev.distance + prev.trafficDelayMinutes * 60) < 
        (current.distance + current.trafficDelayMinutes * 60) ? prev : current
      );

      // Return optimized order of locations
      return bestRoute.order;
    } catch (error) {
      console.error('Error en la optimización de ruta:', error);
      return locations; // Fallback to original order
    }
  };

  const calculateRoute = useCallback(async () => {
    if (!window.google || destinations.length === 0) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      // Optimizar el orden de las paradas usando Fleet Engine API
      const optimizedDestinations = await optimizeRoute(destinations);
      
      const waypoints = optimizedDestinations.map(location => ({
        location: new google.maps.LatLng(location.lat, location.lng),
        stopover: true
      }));

      const result = await directionsService.route({
        origin: new google.maps.LatLng(startPoint.lat, startPoint.lng),
        destination: waypoints[waypoints.length - 1].location,
        waypoints: waypoints.slice(0, -1),
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        },
        provideRouteAlternatives: true
      });

      setDirectionsResponse(result);

      const route = result.routes[0];
      const legs = route.legs;
      
      const routeInfo: RouteInfo = {
        order: [startPoint],
        totalDistance: 0,
        totalDuration: 0,
        legs: []
      };

      legs.forEach((leg) => {
        const legInfo = {
          startLocation: {
            lat: leg.start_location.lat(),
            lng: leg.start_location.lng(),
            nombreProveedor: leg.start_address,
            tipoDireccion: 'Parada'
          },
          endLocation: {
            lat: leg.end_location.lat(),
            lng: leg.end_location.lng(),
            nombreProveedor: leg.end_address,
            tipoDireccion: 'Parada'
          },
          distance: leg.distance?.value || 0,
          duration: leg.duration?.value || 0
        };

        routeInfo.legs.push(legInfo);
        routeInfo.totalDistance += legInfo.distance;
        routeInfo.totalDuration += legInfo.duration;
        routeInfo.order.push(legInfo.endLocation);
      });

      setRouteInfo(routeInfo);
      
      if (onRouteCalculated) {
        onRouteCalculated(routeInfo);
      }
    } catch (error) {
      console.error('Error calculando la ruta:', error);
    }
  }, [startPoint, destinations, onRouteCalculated]);

  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  const center = {
    lat: startPoint.lat,
    lng: startPoint.lng
  };

  if (!isLoaded) {
    return <div>Cargando mapa...</div>;
  }

  return (
    <div className="route-optimizer">
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onLoad={map => {
            mapRef.current = map;
          }}
        >
          {/* Marcador del punto de inicio */}
          <Marker
            position={startPoint}
            label="I"
          />

          {/* Marcadores de destinos */}
          {destinations.map((dest, index) => (
            <Marker
              key={index}
              position={dest}
              label={`${index + 1}`}
            />
          ))}

          {/* Renderizar la ruta */}
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#2196F3',
                  strokeWeight: 4
                }
              }}
            />
          )}
        </GoogleMap>
      </div>

      <div className="controls mt-3">
        <button 
          className="btn btn-primary"
          onClick={calculateRoute}
        >
          Calcular Mejor Ruta
        </button>
      </div>

      {routeInfo && (
        <div className="route-info mt-3">
          <h4>Información de la Ruta:</h4>
          <p>Distancia total: {(routeInfo.totalDistance / 1000).toFixed(2)} km</p>
          <p>Tiempo estimado: {Math.round(routeInfo.totalDuration / 60)} minutos</p>
          
          <h5>Detalles por tramo:</h5>
          {routeInfo.legs.map((leg, index) => (
            <div key={index} className="leg-info">
              <p>Tramo {index + 1}:</p>
              <ul>
                <li>Distancia: {(leg.distance / 1000).toFixed(2)} km</li>
                <li>Tiempo: {Math.round(leg.duration / 60)} minutos</li>
                <li>Proveedor: {leg.startLocation.nombreProveedor}</li>
                <li>Dirección: {leg.startLocation.tipoDireccion}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer;
