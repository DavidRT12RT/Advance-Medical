import React, { useRef } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Button, Col, Divider, Grid, Row, Select, Tooltip } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setAddressIds, setAddressMultiple, setDirecciones } from '@/features/configuracionSlice';
const TIPO_DIRECCION = [
  { label: "Sucursal", value: "Sucursal" },
  { label: "Oficina", value: "Oficina" },
  { label: "Bodega", value: "Bodega" },
  { label: "Tienda", value: "Tienda" },
];

const { useBreakpoint } = Grid;

const libraries: any[] = ["places"]; // Carga solo la librería de lugares (places)

export default function GoogleAddress({ id, place_id = "" }: any) { // ChIJ3RuSukyxKIQRLZqQSNJlnik

  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const {
    addressMultiple,
    direcciones
  } = useSelector((state: any) => state.configuracion);
  const [tipoDireccion, settipoDireccion] = React.useState("");


  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk", // Reemplaza con tu API key de Google Maps
    libraries,
  });

  // const [initialAddress, setInitialAddress] = React.useState<any>();
  const autocompleteRef = useRef<any>(null);

  // Función para obtener la dirección inicial usando el place_id
  /* const fetchAddressByPlaceId = async (placeId: string) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      console.log('results', results)
      if (status === "OK" && results?.length) {
        setInitialAddress(results[0].formatted_address);
      }
    });
  }; */

  /* React.useEffect(() => {
    if (isLoaded && place_id) {
      fetchAddressByPlaceId(place_id);
    }
  }, [isLoaded, place_id]); */

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place) {
      dispatch(setAddressMultiple([...addressMultiple, {
        id,
        place_id: place?.place_id,
        lat: place?.geometry?.location.lat(),
        lng: place?.geometry?.location.lng(),
        place: place?.formatted_address,
        tipoDireccion: tipoDireccion || ""
      }]));
    }
  };

  const handleDelete = () => {
    const direccionesFilter = direcciones.filter((direccion: any) => (direccion?.element));
    if (direccionesFilter.length > 1) {
      // eliminamos el elemento direccion
      const direccionesMap = direcciones.map((direccion: any) => {
        return (direccion.id == id) ? { ...direccion, element: null } : direccion;
      });
      dispatch(setDirecciones(direccionesMap));

      // eliminados los datos de la direcccion
      const addressMultipleFilter = addressMultiple.filter((addrees: any) => {
        return (addrees?.id != id);
      });
      dispatch(setAddressMultiple(addressMultipleFilter));
    }
  }

  return (
    <>
      {isLoaded ? (
        <div style={{ width: "100%", overflow: 'hidden' }}>
          <Row gutter={12}>
            <Col xs={24} sm={16} lg={16}>
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  componentRestrictions: { country: "mx" }, // Restringir a México
                }}
              >
                <input
                  type="text"
                  placeholder="Ingresa una dirección"
                  /* value={initialAddress || ""}
                  onChange={(e) => {
                    setInitialAddress(e.target.value);
                  }} */
                  style={{
                    width: "100%",
                    padding: "7.5px",
                    height: "32px",
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
                  }}
                />
              </Autocomplete>
            </Col>
            <Col xs={20} sm={5} lg={5}>
              <Select
                value={tipoDireccion}
                onChange={(value: string) => {
                  settipoDireccion(value);
                  if (addressMultiple.length) {
                    const addressMultipleMap = addressMultiple.map((address: any) => {
                      return address?.id == id ? { ...address, tipoDireccion: value } : address;
                    });
                    dispatch(setAddressMultiple(addressMultipleMap));
                  }
                }}
                options={TIPO_DIRECCION}
                placeholder="Tipo dirección"
                style={{ width: "100%", height: "32px" }} />
            </Col>
            <Col xs={4} sm={3} lg={3}>
              <div style={{ width: "100%", textAlign: "center" }}>
                <Tooltip title="Eliminar">
                  <Button type="dashed" shape="circle" danger icon={<MinusCircleOutlined />} onClick={handleDelete} />
                </Tooltip>
              </div>
            </Col>
          </Row>
          {screens.xs && <Divider />}
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </>
  );
}
