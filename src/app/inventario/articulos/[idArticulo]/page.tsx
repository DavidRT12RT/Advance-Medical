"use client";
import React from 'react';
import { Col, Input, Row, Image, Typography, Divider, Button, Space, Tooltip, Grid, Collapse, Avatar, Badge, Descriptions } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { useDispatch, useSelector } from 'react-redux';
import { setloadingDetalle, setPerfilClientes } from '@/features/ventasSlice';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  EyeOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import SkeletonClientes from '@/components/ventas/clientes/SkeletonClientes';
import TabsClientes from '@/components/ventas/clientes/TabsClientes';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const DOCUMENTOS: any = {
  "contratos": "Contratos",
  "cfdi": "Cédula de identificación fiscal",
  "otros": "Otros"
};

const style: React.CSSProperties = { width: '100%' };

const page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { idCliente }: any = useParams();
  const screens = useBreakpoint();

  const { loadingDetalle, perfilCliente } = useSelector((state: any) => state.ventas);
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  const { auth } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    if (isFirstLoad) {
      dispatch(setloadingDetalle(true));
      FireStoreVentas.buscarCliente(auth?.empresa?.id, idCliente).then((cliente) => {
        dispatch(setPerfilClientes(cliente));
        dispatch(setloadingDetalle(false));
      });
      setIsFirstLoad(false);
    }
  }, [idCliente, isFirstLoad]);

  let DOCUMENTOS_SOLICITADOS = (perfilCliente?.documentos || [])
    .map((doc: any, index: number) => {
      return [
        {
          key: String((index + 1)),
          label: "Documento",
          children: DOCUMENTOS[doc?.documento] || "---",
        },
        {
          key: String((index + 1)),
          label: "Estado",
          children: <Badge
            status={
              doc?.estatus == "Aceptado"
                ? "success"
                : doc?.estatus == "Rechazado" ? "error" : "processing"
            }
            text={doc?.estatus || "---"} />,
        },
        {
          key: String((index + 1)),
          label: "Archivo",
          children: (
            <Button.Group>
              <Button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = doc?.url;
                  a.target = "_blank";
                  a.download = doc?.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                block
                type="dashed"
                icon={<EyeOutlined />}>Visualizar archivo</Button>
              <Button
                onClick={async () => {
                  const a = document.createElement('a');
                  a.href = doc?.url;
                  a.target = "_blank";
                  a.download = doc?.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                block
                type="dashed"
                icon={<CloudDownloadOutlined />}>Descargar archivo</Button>
            </Button.Group>
          ),
        },

      ]
    });

  DOCUMENTOS_SOLICITADOS = DOCUMENTOS_SOLICITADOS.flat();

  if (loadingDetalle) {
    return <SkeletonClientes />;
  }

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <Tooltip title="Atras">
                  <Button
                    onClick={() => {
                      router.back();
                    }}
                    type="primary"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                  />
                </Tooltip>
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: '0px' }}>
                  Perfil completo del cliente
                </Title>
              </Col>
            </Space>
          </Col>
        </Row>
      </Space>
      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <TabsClientes />
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={6}>
          <div style={{
            ...style,
            borderRadius: "1rem",
            background: "#f2f2f2",
            textAlign: "center",
            padding: screens.md ? "1rem" : "0.5rem",
            margin: "auto"
          }}>
            {Boolean(perfilCliente?.photoURL) ? <Image
              style={{ borderRadius: "1rem" }}
              width={150}
              src={perfilCliente?.photoURL}
            /> : <Avatar shape="square" size={150}><UserOutlined style={{ fontSize: "75px" }} /></Avatar>}

            <Title level={4} style={{ width: "100%" }}>
              {perfilCliente?.nombreCliente}
            </Title>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text>{perfilCliente?.tipoIndustria}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text>{perfilCliente?.id}</Text>
            </div>

            <Divider />

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PhoneOutlined style={{ marginRight: 8 }} />
              <Text>{perfilCliente?.telefonoContacto}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <MailOutlined style={{ marginRight: 8 }} />
              <Text>{perfilCliente?.correoContacto}</Text>
            </div>

            <Divider />

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              <Text>{perfilCliente?.direccion}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <Text>{perfilCliente?.fechaRegistro}</Text>
            </div>

            <Divider />

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text>{perfilCliente?.monedaUtilizada}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text>{perfilCliente?.regimenFiscal}</Text>
            </div>
          </div>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={16} lg={18} xl={18}>
          <div style={{
            ...style,
            textAlign: "left",
            padding: "0px",
            margin: "auto"
          }}>
            <Collapse
              defaultActiveKey={['1', '2', '3', '4']}
              items={[
                {
                  key: '1',
                  label: (
                    <Text style={{ fontWeight: "bold", textAlign: "left" }}>
                      Información del cliente
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Nombre del Contacto</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.nombreContacto || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Teléfono del Contacto</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.telefonoContacto || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Correo del Contacto</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.correoContacto || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Nombre del Banco</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.nombreBanco || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Número de Cuenta</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.numeroCuenta || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Nombre del Beneficiario</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.nombreBeneficiario || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={24} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Fecha de Registro</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.fechaRegistro || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Tipo de Producto</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.tipoProducto || "---"}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </>
                  )
                },
                {
                  key: '2',
                  label: (
                    <Text style={{ fontWeight: "bold", textAlign: "left" }}>
                      Información de Fiscal
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Lugar de Emision</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Lugar_de_Emision || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Fecha de Emisión</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Fecha_de_Emision || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>RFC</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.RFC || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Denominación/Razón Social</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Denominacion_Razon_Social || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Regimen Capital</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Regimen_Capital || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Nombre Comercial</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Nombre_Comercial || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Fecha Inicio Operaciones</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Fecha_inicio_operaciones || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Estatus en el Padrón</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Estatus_en_el_padron || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Estatus en el Padrón</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Estatus_en_el_padron || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={24} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Fecha Último Cambio de Estado</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Fecha_ultimo_cambio_estado || "---"}
                            </Text>
                          </div>
                        </Col>

                        <Col span={24}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Domicilio Registrado</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.Domicilio_Registrado?.Tipo_Vialidad} {perfilCliente?.Domicilio_Registrado?.Nombre_Vialidad},
                              No. Ext {perfilCliente?.Domicilio_Registrado?.Numero_Exterior},
                              Col. {perfilCliente?.Domicilio_Registrado?.Colonia},
                              {perfilCliente?.Domicilio_Registrado?.Municipio_Demarcacion},
                              {perfilCliente?.Domicilio_Registrado?.Entidad_Federativa},
                              C.P. {perfilCliente?.Domicilio_Registrado?.Codigo_Postal}.
                            </Text>
                          </div>
                          {/* <Text strong>Domicilio Registrado: </Text>
                            <Text>
                                {perfilCliente?.Domicilio_Registrado?.Tipo_Vialidad} {perfilCliente?.Domicilio_Registrado?.Nombre_Vialidad}, 
                                No. Ext {perfilCliente?.Domicilio_Registrado?.Numero_Exterior}, 
                                Col. {perfilCliente?.Domicilio_Registrado?.Colonia}, 
                                {perfilCliente?.Domicilio_Registrado?.Municipio_Demarcacion}, 
                                {perfilCliente?.Domicilio_Registrado?.Entidad_Federativa}, 
                                C.P. {perfilCliente?.Domicilio_Registrado?.Codigo_Postal}.
                            </Text> */}
                        </Col>
                        <Divider />
                        <Col span={24}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Actividades Económicas</Text>
                          </div>
                          {perfilCliente?.Actividades_Economicas?.map((actividad: any, index: number) => (
                            <div key={index} style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              <Text>- {actividad.Actividad} ({actividad.Porcentaje}%) - Inicio: {actividad.Fecha_Inicio}</Text>
                            </div>
                          ))}
                        </Col>
                        <Divider />
                        <Col span={24}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Régimenes</Text>
                          </div>
                          {perfilCliente?.Regimenes?.map((regimen: any, index: number) => (
                            <div key={index} style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              <Text>- {regimen.Regimen} - Inicio: {regimen.Fecha_Inicio}</Text>
                            </div>
                          ))}
                        </Col>
                        <Divider />
                        <Col span={24}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Obligaciones Fiscales</Text>
                          </div>
                          {perfilCliente?.Obligaciones?.map((obligacion: any, index: number) => (
                            <div key={index} style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              <Text>- {obligacion.Descripcion}: Vence {obligacion.Vencimiento} - Inicio: {obligacion.Fecha_Inicio}</Text>
                            </div>
                          ))}
                        </Col>
                      </Row>
                    </>
                  )
                },
                {
                  key: '3',
                  label: (
                    <Text style={{ fontWeight: "bold", textAlign: "left" }}>
                      Información de pagos
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Moneda de Pago</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.monedaPago || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Email de Compras</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.emailCompras || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Email de Facturación</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {perfilCliente?.emailFacturacion || "---"}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </>
                  )
                },
                {
                  key: '4',
                  label: (
                    <Text style={{ fontWeight: "bold", textAlign: "left" }}>
                      Tabla de documentos
                    </Text>
                  ),
                  children: (
                    <>
                      <Descriptions size='small' column={1} bordered items={DOCUMENTOS_SOLICITADOS} />
                    </>
                  )
                },
              ]}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default page;