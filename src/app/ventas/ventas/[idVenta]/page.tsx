"use client";
import React from 'react';
import { Col, Input, Row, Typography, Divider, Descriptions, Button, Card, Space, Tooltip, Grid, Collapse, Avatar, Badge, Dropdown, MenuProps, List, Upload } from 'antd';
import { useParams, useRouter } from 'next/navigation';

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
  CreditCardOutlined,
  CopyOutlined,
  EditOutlined,
  SendOutlined,
  DownloadOutlined,
  StopOutlined,
  PaperClipOutlined
} from '@ant-design/icons';

import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import { setDetalleDeCompra } from '@/features/finanzasSlice';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import StaticTableArticulos from '@/components/compras/compras/StaticTableArticulos';
import MapWithRoute from '@/components/GoogleRoute';


const { useBreakpoint } = Grid;

const style: React.CSSProperties = { width: '100%' };


const page = () => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { idCompra }: any = useParams();

  const [loading, setloading] = React.useState(false);
  const [distance, setDistance] = React.useState('');
  const [duration, setDuration] = React.useState('');

  const {
    detalleDeCompra,
    refresh,
  } = useSelector((state: any) => state.finanzas);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);


  React.useEffect(() => {
    if (idCompra) {
      (async () => {
        const empresa: any = await FireStoreFinanzas.buscarCompra(auth?.empresa?.id, idCompra);
        const proveedor = await FireStoreVentas.buscarProveedor(auth?.empresa?.id, empresa?.proveedor);
        dispatch(setDetalleDeCompra({ ...empresa, proveedorPopulate: proveedor }));
      })();
    }
  }, [idCompra, refresh]);


  const pointA = { lat: 37.7749, lng: -122.4194 }; // Ejemplo: San Francisco
  const pointB = { lat: 34.0522, lng: -118.2437 }; // Ejemplo: Los Ángeles


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

  const {
    nombreProveedor = "---",
    emailCompras = "---",
    telefonoContacto = "---",
    direcciones = []
  } = detalleDeCompra?.proveedorPopulate || {};

  const [firstDireccion = {}] = direcciones;


  const comentarios = [
    {
      title: 'Ant Design Typography.Title 1',
    },
    {
      title: 'Ant Design Typography.Title 2',
    },
    {
      title: 'Ant Design Typography.Title 3',
    },
    {
      title: 'Ant Design Typography.Title 4',
    },
    {
      title: 'Ant Design Typography.Title 1',
    },
    {
      title: 'Ant Design Typography.Title 2',
    },
    {
      title: 'Ant Design Typography.Title 3',
    },
    {
      title: 'Ant Design Typography.Title 4',
    },
  ]

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
                  Información de compra
                </Typography.Title>
              </Col>
            </Space>
          </Col>
          <Col>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <Dropdown.Button menu={{
                items,
                onClick: () => { },
              }} onClick={() => {

              }}>
                Acciones
              </Dropdown.Button>
            </div>
          </Col>
        </Row>
      </Space>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card style={{ ...style, height: "100%" }}>
            <Typography.Title level={4}>Información del Proveedor</Typography.Title>
            <p style={{ padding: "0.5rem" }}>
              <UserOutlined style={{ fontSize: "19px" }} />
              <Typography.Text strong> {nombreProveedor}</Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <MailOutlined style={{ fontSize: "19px" }} />
              <Typography.Text strong> {emailCompras}</Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <PhoneOutlined style={{ fontSize: "20px" }} />
              <Typography.Text strong> {telefonoContacto}</Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <EnvironmentOutlined style={{ fontSize: "20px" }} />
              <Typography.Text strong> {firstDireccion?.place || "---"}</Typography.Text>
              <Typography.Text keyboard>{firstDireccion?.tipoDireccion || "---"}</Typography.Text>
            </p>
          </Card>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
          {/* <Badge.Ribbon
            text={detalleDeCompra?.estatus || "---"}
            color={["Aceptado"].includes(detalleDeCompra?.estatus) ? "green" : ["Rechazado"].includes(detalleDeCompra?.estatus) ? "red" : "blue"}> */}
          <Card style={style}>
            <Typography.Title level={4}>Detalles de la Orden</Typography.Title>

            <p style={{ padding: "0.5rem" }}>
              <CalendarOutlined style={{ fontSize: "20px" }} />
              <Typography.Text strong> Fecha de Orden: {detalleDeCompra?.fechaDeCompra || "---"}
              </Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <CarryOutOutlined style={{ fontSize: "20px" }} />
              <Typography.Text strong> Fecha Esperada de Recepción: {detalleDeCompra?.fechaEstimadaDeLlegada || "---"}
              </Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <TruckOutlined style={{ fontSize: "20px" }} />
              <Typography.Text strong> Método de Entrega: {detalleDeCompra?.formaDeEntrega || "---"}
              </Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <CreditCardOutlined style={{ fontSize: "20px" }} />
              <Typography.Text strong> Método de Pago: {detalleDeCompra?.metodoDePago || "---"}
              </Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <Typography.Text strong> Estatus de Pago:
              </Typography.Text>
              <Typography.Text keyboard>{detalleDeCompra?.estatus || "---"}</Typography.Text>
            </p>
            <p style={{ padding: "0.5rem" }}>
              <Typography.Text strong> Politicas de Pago: {detalleDeCompra?.poliza || "---"}
              </Typography.Text>
            </p>

          </Card>
          {/* </Badge.Ribbon> */}
        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card style={style}>
            <Typography.Title level={4}>Información de ruta</Typography.Title>

            <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
              <Col className="gutter-row" xs={24} sm={24} md={16} lg={18} xl={18}>
                <MapWithRoute
                  pointA={pointA}
                  pointB={pointB}
                  setDistance={setDistance}
                  setDuration={setDuration} />
              </Col>
              <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={6}>

                <Typography.Title level={4}>Información del conductor</Typography.Title>
                <p style={{ padding: "0.5rem" }}>
                  <Typography.Text strong>Nombre: {"---"}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <Typography.Text strong>ID: {"---"}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <Typography.Text strong>Contacto: {"---"}</Typography.Text>
                </p>

                <Divider />

                <Typography.Title level={4}>Detalles de la ruta</Typography.Title>
                <p style={{ padding: "0.5rem" }}>
                  <Typography.Text strong>Inicio: {firstDireccion?.place || "---"}</Typography.Text>
                  <Typography.Text keyboard>{firstDireccion?.tipoDireccion || "---"}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <Typography.Text strong>Fin: {firstDireccion?.place || "---"}</Typography.Text>
                  <Typography.Text keyboard>{firstDireccion?.tipoDireccion || "---"}</Typography.Text>
                </p>

                <p style={{ padding: "0.5rem" }}>
                  <Typography.Text strong>Distancia: {distance || "---"}</Typography.Text>
                </p>
                <p style={{ padding: "0.5rem" }}>
                  <Typography.Text strong>Tiempo estimado: {duration || "---"}</Typography.Text>
                </p>
              </Col>
            </Row>

          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Collapse
            size="small"
            defaultActiveKey={[]}
            items={[
              {
                key: '1',
                label: (
                  <Badge offset={[15, 12]} count={([])?.length}>
                    <Typography.Text strong>
                      {`Historial de Cambios`}
                    </Typography.Text>
                  </Badge>
                ),
                children: (
                  <StaticTableArticulos dataSource={[]} showActions={false} />
                )
              },
            ]}
          />

        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Collapse
            size="small"
            defaultActiveKey={['1']}
            items={[
              {
                key: '1',
                label: (
                  <Badge offset={[15, 12]} count={(detalleDeCompra?.articulos || [])?.length}>
                    <Typography.Text strong>
                      {`Lista de artículos registrados`}
                    </Typography.Text>
                  </Badge>
                ),
                children: (
                  <StaticTableArticulos dataSource={detalleDeCompra?.articulos || []} showActions={false} />
                )
              },
            ]}
          />

        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
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
              ${Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            <Descriptions.Item label="Impuestos aplicados">
              ${Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            <Descriptions.Item label="Descuentos aplicados">
              ${Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            <Descriptions.Item label="Total final">
              ${Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
            {/*  <Descriptions.Item label="Aprobado por">
              ${Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}
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
            <Descriptions.Item label="Aprobado por">
              ${Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card style={style}>
            <Typography.Title level={4}>Comentarios</Typography.Title>
            <div style={{ maxHeight: "50vh", overflowY: "auto", margin: "1rem 0rem" }}>
              <List
                itemLayout="horizontal"
                dataSource={comentarios}
                renderItem={(item, index) => (
                  <List.Item
                    style={{ borderColor: "transparent" }}
                    /* actions={["2024-11-15 10:20:00 AM"]} */>
                    <List.Item.Meta
                      avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                      title={<a href="https://ant.design">{item.title}</a>}
                      description={(
                        <>
                          <p><Typography.Text type="secondary">{"Ant Design, a design language for background applications, is refined by Ant UED Team"}</Typography.Text></p>
                          <p><Typography.Text type="secondary">{"2024-11-15 10:20:00 AM"}</Typography.Text></p>
                        </>

                      )}
                    />
                  </List.Item>
                )}
              />
            </div>
            <Input.Search
              placeholder="Escribe un comentario"
              enterButton="Publicar"
              size="large"
              allowClear
              onSearch={(value) => {
                console.log('value', value)
              }}
              loading={false} />
          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card style={style}>
            <Typography.Title level={4}>Archivos</Typography.Title>

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