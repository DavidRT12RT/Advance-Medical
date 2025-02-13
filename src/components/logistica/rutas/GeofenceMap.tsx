/// <reference types="@types/google.maps" />
import { Libraries, useJsApiLoader } from '@react-google-maps/api';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Polygon, DrawingManager, Marker, InfoWindow } from '@react-google-maps/api';

const libraries: Libraries = ["drawing", "geometry"];

interface Location {
  lat: number;
  lng: number;
  info?: string;
  nombreCliente: string;
  place: string;
  tipoDireccion: string;
}

interface GeofenceMapProps {
  onGeofenceComplete: (coordinates: { lat: number; lng: number }[]) => void;
  initialCoordinates?: { lat: number; lng: number }[];
  locations?: Location[];
  onLocationsInPolygon?: (locations: Location[]) => void;
}

const GeofenceMap: React.FC<GeofenceMapProps> = ({ 
  onGeofenceComplete, 
  initialCoordinates = [],
  locations = [],
  onLocationsInPolygon
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk",
    libraries
  });

  const [polygon, setPolygon] = useState<{ lat: number; lng: number }[]>(initialCoordinates);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Calcular el centro del mapa basado en las coordenadas iniciales
  const getMapCenter = useCallback(() => {
    if (!isLoaded) {
      return {
        lat: 19.4326,  // Ciudad de México coordinates
        lng: -99.1332
      };
    }

    if (initialCoordinates && initialCoordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      initialCoordinates.forEach(coord => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
      });
      return {
        lat: bounds.getCenter().lat(),
        lng: bounds.getCenter().lng()
      };
    }
    return {
      lat: 19.4326,  // Ciudad de México coordinates
      lng: -99.1332
    };
  }, [initialCoordinates, isLoaded]);

  const center = getMapCenter();

  const mapOptions: google.maps.MapOptions = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
  };

  const drawingManagerOptions = {
    polygonOptions: {
      fillColor: '#2196F3',
      strokeColor: '#2196F3',
      fillOpacity: 0.3,
      strokeWeight: 2,
      clickable: true,
      editable: true,
      draggable: true,
      zIndex: 1,
    },
    drawingControl: true,
    drawingControlOptions: {
      position: window.google?.maps?.ControlPosition?.TOP_CENTER,
      drawingModes: [window.google?.maps?.drawing?.OverlayType?.POLYGON],
    },
  };

  // Función para verificar qué ubicaciones están dentro del polígono
  const checkLocationsInPolygon = useCallback((polygonPath: google.maps.LatLng[]) => {
    if (!window.google?.maps?.geometry?.poly) return;

    const locationsInside = locations.filter(location => {
      const point = new google.maps.LatLng(location.lat, location.lng);
      return google.maps.geometry.poly.containsLocation(point, new google.maps.Polygon({
        paths: polygonPath
      }));
    });

    if (onLocationsInPolygon) {
      onLocationsInPolygon(locationsInside);
    }
  }, [locations, onLocationsInPolygon]);

  // Crear polígono inicial
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Limpiar polígono existente
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Limpiar listeners existentes
    if (listenersRef.current.length > 0) {
      listenersRef.current.forEach(listener => {
        google.maps.event.removeListener(listener);
      });
      listenersRef.current = [];
    }

    if (initialCoordinates.length > 0) {
      const newPolygon = new window.google.maps.Polygon({
        paths: initialCoordinates,
        ...drawingManagerOptions.polygonOptions,
        map: mapRef.current,
      });

      polygonRef.current = newPolygon;

      // Ajustar el mapa para mostrar todo el polígono
      const bounds = new window.google.maps.LatLngBounds();
      initialCoordinates.forEach(coord => {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
      });
      mapRef.current.fitBounds(bounds);

      // Agregar listeners para edición
      const pathListeners = [
        google.maps.event.addListener(newPolygon.getPath(), 'set_at', () => {
          if (!polygonRef.current) return;
          const path = polygonRef.current.getPath();
          const updatedCoords = path.getArray().map(latLng => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
          setPolygon(updatedCoords);
          onGeofenceComplete(updatedCoords);
          checkLocationsInPolygon(path.getArray());
        }),
        google.maps.event.addListener(newPolygon.getPath(), 'insert_at', () => {
          if (!polygonRef.current) return;
          const path = polygonRef.current.getPath();
          const updatedCoords = path.getArray().map(latLng => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
          setPolygon(updatedCoords);
          onGeofenceComplete(updatedCoords);
          checkLocationsInPolygon(path.getArray());
        }),
      ];

      listenersRef.current = pathListeners;

      // Verificar ubicaciones iniciales
      const pathArray = initialCoordinates.map(coord => 
        new google.maps.LatLng(coord.lat, coord.lng)
      );
      checkLocationsInPolygon(pathArray);
    }
  }, [isLoaded, initialCoordinates]);

  const onPolygonComplete = useCallback((poly: google.maps.Polygon) => {
    if (!poly.getPath) return;
    const path = poly.getPath();
    const coordinates = path.getArray().map(latLng => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));
    
    setPolygon(coordinates);
    onGeofenceComplete(coordinates);
    checkLocationsInPolygon(path.getArray());

    poly.setMap(null);

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    const newPolygon = new window.google.maps.Polygon({
      paths: coordinates,
      ...drawingManagerOptions.polygonOptions,
      map: mapRef.current,
    });

    polygonRef.current = newPolygon;

    // Add listeners for editing the polygon
    const listeners = [
      google.maps.event.addListener(newPolygon.getPath(), 'set_at', () => {
        const path = newPolygon.getPath();
        const updatedCoords = path.getArray().map(latLng => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        setPolygon(updatedCoords);
        onGeofenceComplete(updatedCoords);
        checkLocationsInPolygon(path.getArray());
      }),
      google.maps.event.addListener(newPolygon.getPath(), 'insert_at', () => {
        const path = newPolygon.getPath();
        const updatedCoords = path.getArray().map(latLng => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        setPolygon(updatedCoords);
        onGeofenceComplete(updatedCoords);
        checkLocationsInPolygon(path.getArray());
      }),
    ];

    listenersRef.current = listeners;
  }, [onGeofenceComplete, drawingManagerOptions.polygonOptions, checkLocationsInPolygon]);

  // Cleanup function
  const onUnmount = useCallback(() => {
    listenersRef.current.forEach(listener => {
      google.maps.event.removeListener(listener);
    });
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
  }, []);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '300px'
      }}
      zoom={5}
      center={center}
      options={mapOptions}
      onLoad={map => {
        mapRef.current = map;
      }}
      onUnmount={onUnmount}
    >
      <DrawingManager
        options={drawingManagerOptions}
        onPolygonComplete={onPolygonComplete}
      />
      
      {polygon.length > 0 && !polygonRef.current && (
        <Polygon
          path={polygon}
          options={drawingManagerOptions.polygonOptions}
        />
      )}

      {locations.map((location, index) => (
        <Marker
          key={index}
          position={{ lat: location.lat, lng: location.lng }}
          onClick={() => setSelectedLocation(location)}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div style={{ padding: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>{selectedLocation?.nombreCliente}</h4>
            <p style={{ margin: '4px 0' }}><strong>Dirección:</strong> {selectedLocation.place}</p>
            <p style={{ margin: '4px 0' }}><strong>Tipo:</strong> {selectedLocation.tipoDireccion}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GeofenceMap;
