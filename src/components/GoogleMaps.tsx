import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setAddress, setCoordinates } from '@/features/configuracionSlice';
import { setPerfilProveedores, setPerfilClientes } from '@/features/ventasSlice';

const libraries: any[] = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "250px",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

export default function GoogleMaps({ title, showMap = true }: any) {

  const dispatch = useDispatch();
  const {
    coordinates,
    address,
    openDrawer,
    detalleDeSucursal
  } = useSelector((state: any) => state.configuracion);

  const { openDrawerSucursal } = useSelector((state: any) => state.recursosHumanos)

  const { perfilProveedor } = useSelector((state: any) => state.ventas);
  const { perfilCliente } = useSelector((state: any) => state.ventas);

  const [center, setcenter] = useState({
    lat: 23.6345,
    lng: -102.5528,
  });
  const [zoom, setzoom] = useState(5);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk",
    libraries,
  });

  const [marker, setMarker] = useState(null);
  const mapRef = useRef<any>();
  const autocompleteRef = useRef<any>(null);
  const searchRef = useRef<any>(null);

  // Reiniciar estado al abrir el Drawer
  React.useEffect(() => {
    if (openDrawer || openDrawerSucursal) {
      setMarker(null);
      dispatch(setCoordinates({ lat: null, lng: null }));
      dispatch(setAddress(''));

      if (searchRef.current) {
        searchRef.current.value = "";
      }

      setzoom(5);
      mapRef.current?.setZoom(5);
      setcenter({
        lat: 23.6345, // mexico
        lng: -102.5528, // mexico
      });
    }
  }, [openDrawer, openDrawerSucursal]);

  const onMapClick = useCallback((event: any) => {
    const latLng: any = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarker(latLng);
    dispatch(setCoordinates(latLng));
    geocodePosition(latLng);
  }, []);

  const onMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const geocodePosition = (position: any) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results: any, status) => {
      if (status === "OK" && results[0]) {
        dispatch(setAddress(results[0].formatted_address));
      } else {
        dispatch(setAddress("No se pudo obtener la dirección"));
      }
    });
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const latLng: any = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setMarker(latLng);
      dispatch(setCoordinates(latLng));
      mapRef.current.setCenter(latLng);
      mapRef.current.setZoom(15);
      geocodePosition(latLng);
    }
  };

  // RELLENAMOS LA UBICACION AL EDITAR
  React.useEffect(() => {
    if (detalleDeSucursal) {
      loadSavedLocation(detalleDeSucursal?.direccion || "", detalleDeSucursal?.coordinates || {
        lat: 23.6345, // mexico
        lng: -102.5528, // mexico
      });
    }
  }, [detalleDeSucursal]);

  React.useEffect(() => {
    if (perfilProveedor) {
      loadSavedLocation(perfilProveedor?.direccion || "", perfilProveedor?.coordinates || {
        lat: 23.6345, // mexico
        lng: -102.5528, // mexico
      });
    }
  }, [perfilProveedor]);

  React.useEffect(() => {
    if (perfilCliente) {
      loadSavedLocation(perfilCliente?.direccion || "", perfilCliente?.coordinates || {
        lat: 23.6345, // mexico
        lng: -102.5528, // mexico
      });
    }
  }, [perfilCliente]);

  // Simulación de cargar datos guardados (por ejemplo, al editar)
  const loadSavedLocation = (address: string, coordinates: any) => {

    setMarker(coordinates);
    dispatch(setCoordinates(coordinates));
    dispatch(setAddress(address));
    mapRef.current?.setCenter(coordinates);
    mapRef.current?.setZoom(15);
    setzoom(15);
    setcenter(coordinates);

  };

  if (loadError) return <div>Error cargando el mapa</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div>
      <Typography.Text strong>{title}</Typography.Text>

      <Autocomplete
        onLoad={(autocomplete) => {(autocompleteRef.current = autocomplete)
          if (searchRef.current) {
            searchRef.current.value = detalleDeSucursal?.direccion || perfilProveedor?.direccion || perfilCliente?.direccion || "";
          }
        }}
        onPlaceChanged={handlePlaceSelect}
        options={{
          componentRestrictions: { country: "mx" }, // Restringir a México
        }}
      >
        <input
          type="search"
          ref={searchRef}
          placeholder={title}
          style={{
            width: "100%",
            padding: "7.5px",
            height: showMap ? "33px" : "40px",
            backgroundColor: "white",
            color: "rgba(0, 0, 0, 0.85)",
            marginBottom: "10px",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            transition: "all 0.3s",
            outline: "none",
            appearance: "textfield",
            zIndex: 10000
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #40a9ff")}
          onBlur={(e) => (e.target.style.border = "1px solid #d9d9d9")}
        />
      </Autocomplete>

      <div style={{ width: "100%", display: !showMap ? "none" : "" }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={zoom}
          center={center}
          options={options}
          onClick={onMapClick}
          onLoad={onMapLoad}
        >
          {marker && <Marker position={marker} draggable onDragEnd={(e) => onMapClick(e)} />}
        </GoogleMap>
      </div>

      <div style={{width: "100%", display: !showMap ? "none" : ""}}>
        <p><strong>Coordenadas:</strong> Lat: {coordinates.lat}, Lng: {coordinates.lng}</p>
        <p><strong>Dirección:</strong> {address}</p>
      </div>

      {/* Botón para cargar la ubicación guardada (simulación) */}
      {/* <button onClick={loadSavedLocation}>Cargar ubicación guardada</button> */}
    </div >
  );
}
