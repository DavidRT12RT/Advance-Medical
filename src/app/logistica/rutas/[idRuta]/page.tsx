"use client";
import React from 'react';
import { Col, Input, Row, Typography, Divider, Descriptions, Button, Card, Space, Tabs, Tooltip, Avatar, Form, Dropdown, MenuProps, List, Upload, Menu, Select, Checkbox, Flex, DatePicker, TableProps, Table } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { useDispatch, useSelector } from 'react-redux';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CarryOutOutlined,
  TruckOutlined,
  CopyOutlined,
  EditOutlined,
  SendOutlined,
  DownloadOutlined,
  StopOutlined,
  PaperClipOutlined,
  EllipsisOutlined,
  FieldTimeOutlined,
  AimOutlined,
  ProfileOutlined,
  TagsOutlined,
  TeamOutlined
} from '@ant-design/icons';

import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import { setListaDeComentarios, setDetalleDeRuta } from '@/features/finanzasSlice';

import StaticTableArticulos from '@/components/compras/compras/StaticTableArticulos';
import MapWithRoute from '@/components/GoogleRoute';
import StaticTableGastos from '@/components/compras/compras/StaticTableGastos';

import { setPerfilUsuario } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import MultipleDestinationsMap from '@/components/MultipleDestinationsMap';


const style: React.CSSProperties = { width: '100%' };


const page = () => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { idRuta }: any = useParams();

  /* const [form] = Form.useForm();
  const [formTransito] = Form.useForm();

  const [loading, setloading] = React.useState(false);
  const [distance, setDistance] = React.useState('');
  const [duration, setDuration] = React.useState(''); */

  // Estados para manejar comentarios
  const [nuevoComentario, setNuevoComentario] = React.useState('');
  const [cargandoComentario, setCargandoComentario] = React.useState(false);


  const {
    detalleDeRuta,
    refresh,
    listaDeComentarios
  } = useSelector((state: any) => state.finanzas);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    perfilUsuario: choferDeLaRuta
  } = useSelector((state: any) => state.recursosHumanos);

  console.log('detalleDeRuta', detalleDeRuta)


  React.useEffect(() => {
    if (idRuta && auth?.empresa) {
      (async () => {
        const ruta: any = await FireStoreFinanzas.buscarRuta(auth?.empresa?.id, idRuta);
        dispatch(setDetalleDeRuta(ruta));
        if (ruta?.chofer) {
          const chofer: any = await FireStoreRecursosHumanos.buscarUsuario(ruta?.chofer);
          dispatch(setPerfilUsuario(chofer));

          // console.log('chofer', chofer);

          let unidad: any = {};
          if (chofer?.unidadAsignada) {
            unidad = await FireStoreFinanzas.buscarUnidad(auth?.empresa?.id, chofer?.unidadAsignada);
            dispatch(setPerfilUsuario({ ...chofer, unidad }));
          }

          if (chofer?.sucursal) {
            const sucursal = await FireStoreConfiguracion.buscarSucursal(auth?.empresa?.id, chofer?.sucursal);
            dispatch(setPerfilUsuario({ ...chofer, unidad, sucursal }));
          }
        }
      })();
    }
  }, [auth, idRuta, refresh]);


  const items: MenuProps['items'] = [
    {
      label: 'Duplicar Orden',
      key: '1',
      icon: <CopyOutlined />, // Icono para duplicar (copiar)
    },
    {
      label: 'Editar Orden',
      key: '2',
      icon: <EditOutlined />, // Icono para editar
    },
    {
      label: 'Enviar Orden',
      key: '3',
      icon: <SendOutlined />, // Icono para enviar (correo o flecha)
    },
    {
      label: 'Descargar Orden',
      key: '4',
      icon: <DownloadOutlined />, // Icono para descargar
    },
    {
      label: 'Cancelar Orden',
      key: '5',
      icon: <StopOutlined />, // Icono para cancelar o detener
      danger: true,
    },
  ];


  // Archivos
  const [fileList, setFileList] = React.useState([]);
  const handleChange = ({ fileList: newFileList }: any) => {
    // Limita la cantidad de archivos a 8
    setFileList(newFileList);
  };
  const handleNameChange = (e: any, file: any) => {
    const updatedList: any = fileList.map((item: any) => {
      if (item.uid === file.uid) {
        return { ...item, customName: e.target.value };
      }
      return item;
    });
    setFileList(updatedList);
  };

  // Cargar comentarios
  React.useEffect(() => {
    if (idRuta && auth?.empresa?.id) {
      FireStoreFinanzas.listarComentarios(
        auth.empresa.id,
        idRuta
      ).then((comentarios: any) => {
        dispatch(setListaDeComentarios(comentarios));
      });
    }
  }, [idRuta, auth?.empresa?.id, dispatch]);

  // Función para agregar un comentario
  const agregarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    setCargandoComentario(true);
    try {
      console.log("auth: ", auth)
      const resultado = await FireStoreFinanzas.agregarComentario(
        auth.empresa.id,
        idRuta,
        {
          texto: nuevoComentario,
          usuario: {
            // id: auth.usuario.id,
            id: auth.empresa.id,
            nombre: auth.displayName,
            // avatar: auth.usuario.avatar
          },
          fecha: new Date()
        }
      );

      if (resultado) {
        // Recargar la lista de comentarios
        const comentariosActualizados = await FireStoreFinanzas.listarComentarios(
          auth.empresa.id,
          idRuta
        );
        dispatch(setListaDeComentarios(comentariosActualizados));
        setNuevoComentario('');
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    } finally {
      setCargandoComentario(false);
    }
  };

  // Componente de lista de comentarios
  const elementoComentariosList = (
    <List
      className="comment-list"
      itemLayout="horizontal"
      dataSource={listaDeComentarios}
      renderItem={(comentario: any) => (
        <List.Item style={{ borderColor: "transparent" }} >
          <List.Item.Meta
            avatar={<Avatar src={comentario.usuario.avatar}>{comentario.usuario.nombre[0]}</Avatar>}
            title={
              <Space>
                <Typography.Text strong>{comentario.usuario.nombre}</Typography.Text>
                <Typography.Text type="secondary">
                  {new Date(comentario.fecha).toLocaleString()}
                </Typography.Text>
              </Space>
            }
            description={comentario.texto}
          />
        </List.Item>
      )}
    />
  );

  const columns: TableProps<any>['columns'] = [
    {
      title: 'Nombre',
      dataIndex: 'nombreCliente',
      key: 'nombreCliente',
    },
    {
      title: 'Contacto',
      dataIndex: 'nombreContacto',
      key: 'nombreContacto',
      render: (text, record, index) => {
        return <div>
          <p>{record?.nombreContacto || '---'}</p>
          <p><Typography.Text type="secondary">{record?.correoContacto || '---'}</Typography.Text></p>
          <p><Typography.Text type="secondary">{record?.telefonoContacto || '---'}</Typography.Text></p>
        </div>;
      },
    },
    {
      title: 'Direcciones',
      dataIndex: 'place',
      key: 'place',
      render: (text, record, index) => {
        return <div>
          <p>{record?.place || '---'}</p>
        </div>;
      },
    },
    {
      title: 'ETA',
      dataIndex: 'place',
      key: 'place',
      render: (text, record, index) => {

        return routeInfo[index]?.arrivalTime ? (
          <div>
            <p>{routeInfo[index]?.arrivalTime}</p>
          </div>
        ) : (
          <div>
            <p>---</p>
          </div>
        )
      },
    },
  ];



  console.log('choferDeLaRuta', choferDeLaRuta)
  // Example usage:
  const startPoint = choferDeLaRuta?.sucursal?.coordinates || null; // Bogotá coordinates
  /* const destinations = [
    { lat: 4.6482837, lng: -74.2478938 }, // Example destination 1
    { lat: 4.7110447, lng: -74.2121763 }, // Example destination 2
    { lat: 4.6897100, lng: -74.1817500 }, // Example destination 3
  ]; */

  const [destinations, setDestinations] = React.useState<any[]>([]);
  React.useEffect(() => {

    if (detalleDeRuta) {
      const arrayUbicaciones: any[] = [];
      const clientes = (detalleDeRuta?.clientesSeleccionadosEnGeofence || []).length
        ? detalleDeRuta?.clientesSeleccionadosEnGeofence
        : detalleDeRuta?.clientes || [];

      clientes.forEach(({ direcciones = [], ...cliente }: any) => {
        direcciones.forEach((direccion: any) => {
          arrayUbicaciones.push({
            lat: direccion?.lat,
            lng: direccion?.lng,
            place: direccion?.place,
            tipoDireccion: direccion?.tipoDireccion,
            ...cliente
          });
        });
      });

      setDestinations(arrayUbicaciones);
    }
  }, [detalleDeRuta]);

  const [routeInfo, setRouteInfo] = React.useState<any[]>([]);

  const handleRouteCalculated = (routeInfo: any) => {
    console.log('Route information:', routeInfo);
    setRouteInfo(routeInfo);
  };


  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <Tooltip title="Atras">
                  <Button onClick={() => {
                    router.back();
                  }} type="primary" shape="circle" icon={<ArrowLeftOutlined />} />
                </Tooltip>
              </Col>
              <Col>
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>
                  Información de la ruta
                </Typography.Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Space>
              <Col>
              </Col>
              <Col xs={24}>
                <Tooltip title="Acciones">
                  <Dropdown
                    overlay={<Menu
                      items={items}
                    />}
                    trigger={["click"]}
                  >
                    <Button icon={<EllipsisOutlined />} />
                  </Dropdown>
                </Tooltip>
              </Col>
            </Space>
          </Col>
        </Row>
      </Space>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title="Información de la ruta" style={{ ...style, height: "100%" }}>


            {/* (detalleDeRuta?.proveedorPopulate || [])?.length == 1 */true ? (
              <>
                <p style={{ padding: "0.5rem" }}>
                  {/* <UserOutlined style={{ fontSize: "19px" }} /> */}
                  <EnvironmentOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Nombre de la ruta: {detalleDeRuta?.nombreDeRuta}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <CalendarOutlined style={{ fontSize: "19px" }} />
                  <Typography.Text strong> Días de entrega: {detalleDeRuta?.diasDeEntrega.join(", ")}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <CarryOutOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Frecuencia de entrega: {detalleDeRuta?.frecuenciaDeEntrega}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <FieldTimeOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Horario de salida: {detalleDeRuta?.horaDeSalida || "---"}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <AimOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Tipo de ruta: <Typography.Text keyboard>{detalleDeRuta?.tipoDeRuta || "---"}</Typography.Text></Typography.Text>
                </p>
              </>
            ) : (

              <Tabs
                // defaultActiveKey="1"
                tabPosition="top"
                type="card"
                style={{ height: "100%" }}
                items={detalleDeRuta?.proveedorPopulate?.map((proveedor: any, i: number) => {
                  return {
                    label: <Typography.Text strong>{proveedor?.nombreProveedor}</Typography.Text>,
                    key: proveedor?.id,
                    disabled: false,
                    children: (
                      <>
                        <p style={{ padding: "0.5rem" }}>
                          <UserOutlined style={{ fontSize: "19px" }} />
                          <Typography.Text strong> {proveedor?.nombreProveedor}</Typography.Text>
                        </p>
                        <p style={{ padding: "0.5rem" }}>
                          <MailOutlined style={{ fontSize: "19px" }} />
                          <Typography.Text strong> {proveedor?.emailCompras}</Typography.Text>
                        </p>
                        <p style={{ padding: "0.5rem" }}>
                          <PhoneOutlined style={{ fontSize: "20px" }} />
                          <Typography.Text strong> {proveedor?.telefonoContacto}</Typography.Text>
                        </p>
                        <p style={{ padding: "0.5rem" }}>
                          <EnvironmentOutlined style={{ fontSize: "20px" }} />
                          <Typography.Text strong> {proveedor?.direcciones?.[0]?.place || "---"}</Typography.Text>
                          <Typography.Text keyboard>{proveedor?.direcciones?.[0]?.tipoDireccion || "---"}</Typography.Text>
                        </p>
                      </>
                    ),
                  };
                })}
              />
            )}


          </Card>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>

          <Card title="Detalles del chofer y unidad" style={{ ...style, height: "100%" }}>
            <Row gutter={0} >
              <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                <p style={{ padding: "0.5rem" }}>
                  <UserOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Chofer: {`${choferDeLaRuta?.nombres || "Desconocido"} ${choferDeLaRuta?.apellidos || "Desconocido"}`}
                  </Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <PhoneOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Teléfono: {choferDeLaRuta?.telefono || "---"}
                  </Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <MailOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Correo: {choferDeLaRuta?.email || "---"}
                  </Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <EnvironmentOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Dirección: {choferDeLaRuta?.direccion || "---"}
                  </Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <CalendarOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Fecha de nacimiento:
                  </Typography.Text>
                  <Typography.Text keyboard>{choferDeLaRuta?.fechaNacimiento || "---"}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <TeamOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Genero: {choferDeLaRuta?.genero || "---"}
                  </Typography.Text>
                </p>
              </Col>

              <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                <p style={{ padding: "0.5rem" }}>
                  <TagsOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Placas: {`${choferDeLaRuta?.unidad?.placas || "---"}`}
                  </Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <TruckOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Tipo de vehiculo: {choferDeLaRuta?.unidad?.tipoVehiculo || "---"}
                  </Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <ProfileOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Marca y Modelo: {`${choferDeLaRuta?.unidad?.marca || "---"} - ${choferDeLaRuta?.unidad?.modelo || "---"}`}
                  </Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <CalendarOutlined style={{ fontSize: "20px" }} />
                  <Typography.Text strong> Año de fabricacion: {choferDeLaRuta?.unidad?.anioFabricacion || "---"}
                  </Typography.Text>
                </p>
              </Col>
            </Row>
          </Card>

        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card title="Información de ruta" style={style}>
            {/* <Typography.Title level={4}>Información de ruta</Typography.Title> */}

            <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
              <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                {/* <MapWithRoute
                  pointA={pointA}
                  pointB={pointB}
                  setDistance={setDistance}
                  setDuration={setDuration} /> */}
                <MultipleDestinationsMap
                  startPoint={startPoint}
                  destinations={destinations}
                  onRouteCalculated={handleRouteCalculated}
                />
              </Col>
              <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>

                <Typography.Title level={5}>Lista de clientes</Typography.Title>
                <Table
                  bordered
                  pagination={false}
                  columns={columns}
                  dataSource={destinations}
                  scroll={{
                    x: 425,
                  }} size="small" />

                <Divider />

                <Typography.Title level={5}>Resumen de la ruta</Typography.Title>
                <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>

                  {routeInfo.map((info, index) => (
                    <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
                      <Typography.Text strong>Destino {index + 1}:</Typography.Text>
                      <br />
                      <Typography.Text>Distancia: {info.distance}</Typography.Text>
                      <br />
                      <Typography.Text>Duración: {info.duration}</Typography.Text>

                    </Col>
                  ))}

                </Row>

              </Col>
            </Row>

          </Card>
        </Col>
      </Row>


      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Card title="Artículos" style={style}>
          {(detalleDeRuta?.proveedorPopulate || []).map((proveedor: any, index: number) => {
            return (
              <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24} key={index} style={{ marginBottom: "1rem" }}>
                <Typography.Title style={{ paddingBottom: "0.5rem" }} level={5}>{proveedor?.nombreProveedor}{/* , lista de artículos {(proveedor?.articulos || [])?.length} */} </Typography.Title>
                <StaticTableArticulos dataSource={proveedor?.articulos || []} showActions={false} />
              </Col>
            )
          })}
        </Card>
      </Row>

      {Boolean(detalleDeRuta?.gastosAdicionales?.length) && <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Card title="Gastos adicionales" style={style}>
          <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
            <StaticTableGastos dataSource={detalleDeRuta?.gastosAdicionales || []} showActions={false} />
          </Col>
        </Card>
      </Row>}

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Divider />
          <Descriptions
            title="Total de la Orden y Resumen Financiero"
            bordered
            column={{
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 3,
            }}
          >
            <Descriptions.Item label="Subtotal antes de impuestos">
              ${Number(detalleDeRuta?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            <Descriptions.Item label="Impuestos aplicados">
              ${Number(detalleDeRuta?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            <Descriptions.Item label="Descuentos aplicados">
              ${Number(detalleDeRuta?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            <Descriptions.Item label="Total final">
              ${Number(detalleDeRuta?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            {/*  <Descriptions.Item label="Aprobado por">
              ${Number(detalleDeRuta?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item> */}
          </Descriptions>
          <Divider />
          <Descriptions
            // title="Total de la Orden y Resumen Financiero"
            bordered
            column={{
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 3,
            }}
          >
            <Descriptions.Item label="Persona responsable">
              ${Number(detalleDeRuta?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
          </Descriptions>
          <Divider />
        </Col>
      </Row>

      <Row gutter={12} style={{ ...style/* , marginTop: "1rem"  */ }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card title="Comentarios" style={style}>

            <div style={{ maxHeight: "50vh", overflowY: "auto", margin: "1rem 0rem" }}>
              {elementoComentariosList}
            </div>

            <div style={{ position: 'relative' }}>
              <Input.TextArea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  e.preventDefault(); // Prevenir el salto de línea
                  if (!e.shiftKey && nuevoComentario.trim()) { // Solo enviar si no se presiona Shift+Enter y hay texto
                    agregarComentario();
                  }
                }}
                style={{
                  borderRadius: '8px',
                  padding: '8px 40px 8px 12px' // Dar espacio para el botón
                }}
              />
              <Button
                type="text"
                icon={<SendOutlined />}
                onClick={agregarComentario}
                loading={cargandoComentario}
                disabled={!nuevoComentario.trim()}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1890ff'
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card title="Archivos" style={style}>

            <Upload
              listType="picture"
              fileList={fileList}
              multiple
              onChange={handleChange}
              beforeUpload={() => false}
              itemRender={(originNode, file: any) => {
                return (
                  <div style={{ width: "50%", float: "left", padding: "0.5rem" }}>
                    {originNode} {/* Muestra la vista previa del archivo */}
                    <Input
                      placeholder="Nombre del archivo"
                      value={file.customName || ''} // Muestra el nombre actual del archivo
                      onChange={(e) => handleNameChange(e, file)} // Cambia el nombre
                    />
                  </div>
                )
              }}
            >
              <Button size='large' type="dashed" block icon={<PaperClipOutlined />}>
                Seleccionar archivos
              </Button>
            </Upload>

            {Boolean(fileList.length) && (
              <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
                <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6} />
                <Col className="gutter-row" xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Button type="primary" block size='large'>Cargar archivos</Button>
                </Col>
                <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6} />
              </Row>
            )}

          </Card>
        </Col>
      </Row>

    </div>

  )
}

export default page;