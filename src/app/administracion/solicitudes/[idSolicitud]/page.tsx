"use client";
import React from 'react';
import { Col, Row, Image, Typography, Divider, Descriptions, Button, Space, Tooltip, Grid, Collapse, Avatar, Badge } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setRefresh } from '@/features/administracionSlice';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  EyeOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';

import { enviarEmail } from '@/helpers/email';

import FireStoreAdministracion from '@/firebase/FireStoreAdministracion';
import { setDetalleDeSolicitud } from '@/features/administracionSlice';


let DOCUMENTOS: any = {
  "actaConstitutiva": "Acta constitutiva",
  "cfdi": "Cédula de identificación fiscal",
  "comprobanteDeDomicilioFiscal": "Comprobante de domicilio fiscal",
  "identificacionOficialFrente": "Identificación oficial frente",
  "identificacionOficialPosterior": "Identificación oficial posterior",
};


const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const style: React.CSSProperties = { width: '100%' };


const page = () => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { idSolicitud } = useParams();
  const screens = useBreakpoint();

  const [loading, setloading] = React.useState(false);

  const {
    detalleDeSolicitud,
    refresh,
  } = useSelector((state: any) => state.administracion);

  React.useEffect(() => {
    if (idSolicitud) {
      (async () => {
        const empresa = await FireStoreAdministracion.buscarEmpresa(idSolicitud);
        dispatch(setDetalleDeSolicitud(empresa));
      })();
    }
  }, [idSolicitud, refresh]);

  let DOCUMENTOS_SOLICITADOS = (detalleDeSolicitud?.documentos || [])
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

  const ESTATUS_POSTULANTE = detalleDeSolicitud?.estatus;


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
                <Title level={4} style={{ marginBottom: '0px' }}>
                  Información completa de la empresa
                </Title>
              </Col>
            </Space>
          </Col>
          <Col>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <Button.Group>
                <Button type="primary"
                  icon={<CheckCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                  onClick={async () => {
                    try {
                      setloading(true);

                      await FireStoreAdministracion.registrarEmpresa({
                        id: detalleDeSolicitud?.id,
                        estatus: "Aceptado",
                        motivoRechazo: "",
                        documentos: (detalleDeSolicitud.documentos || []).map((documento: any) => {
                          return { ...documento, estatus: "Aceptado" };
                        })
                      });
                      await enviarEmail({
                        to: detalleDeSolicitud?.email,
                        subject: "¡Enhorabuena! Su Empresa ha sido Aceptada en SMARTROUTE",
                        plantilla: "generarPlantillaHTMLEmpresaAceptada",
                        nombreContactoPrincipal: detalleDeSolicitud?.nombre,
                        nombreEmpresa: detalleDeSolicitud?.nombreDeLaEmpresa,
                        linkInicioSesion: `${location.origin}/empresas/login`
                      });
                      setloading(false);
                      dispatch(setRefresh(Math.random()));
                      Swal.fire({
                        title: "Empresa aceptada!",
                        text: "",
                        icon: "success"
                      });
                    } catch (error: any) {
                      Swal.fire({
                        title: "Error!",
                        text: error.toString(),
                        icon: "error"
                      });
                    }
                  }}
                  loading={loading}
                  disabled={!["En revisión"].includes(ESTATUS_POSTULANTE)}>Aceptar empresa</Button>

                <Button type="primary"
                  danger
                  icon={<CloseCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                  onClick={async () => {
                    try {
                      const { value: text } = await Swal.fire({
                        title: "Ingrese la razón del rechazo",
                        input: "textarea",
                        //inputLabel: "Ingresar la razón del rechazo",
                        inputPlaceholder: "Ingrese la razón del rechazo...",
                        inputAttributes: {
                          "aria-label": "Ingrese la razón del rechazo"
                        },
                        showCancelButton: true,
                        confirmButtonText: "Enviar",  // Cambia el texto del botón de confirmación
                        cancelButtonText: "Cancelar", // Cambia el texto del botón de cancelación
                        confirmButtonColor: '#1677ff', // Color del botón OK
                        cancelButtonColor: '#ff4d4f',    // Color del botón Cancelar
                        preConfirm: (value) => {
                          if (!value) {
                            Swal.showValidationMessage("Ingrese la razón del rechazo");
                            return false; // Impide que se cierre el modal si no hay texto
                          }
                          return value; // Retorna el valor si pasa la validación
                        }
                      });

                      if (text) {

                        await FireStoreAdministracion.registrarEmpresa({
                          id: detalleDeSolicitud?.id,
                          estatus: "Rechazado",
                          motivoRechazo: text,
                          documentos: (detalleDeSolicitud.documentos || []).map((documento: any) => {
                            return { ...documento, estatus: "Rechazado" };
                          })
                        });

                        await enviarEmail({
                          to: detalleDeSolicitud?.email,
                          subject: "Información sobre el Proceso de Registro en SMARTROUTE",
                          plantilla: "generarPlantillaHTMLRegistroRechazo",
                          nombreContactoPrincipal: detalleDeSolicitud?.nombre,
                          nombreEmpresa: detalleDeSolicitud?.nombreDeLaEmpresa,
                          motivoRechazo: text
                        });

                        dispatch(setRefresh(Math.random()));
                        Swal.fire({
                          title: "Empresa rechazada!",
                          text: "",
                          icon: "success"
                        });
                      }
                    } catch (error: any) {
                      Swal.fire({
                        title: "Error!",
                        text: error.toString(),
                        icon: "error"
                      });
                    }

                  }}
                  disabled={!["En revisión"].includes(ESTATUS_POSTULANTE)}>Rechazar empresa</Button>
              </Button.Group>
            </div>
          </Col>
        </Row>
      </Space>

      {/* <Drawer
        title={detalleDeSolicitud?.entrevista?.id ? 'Editar entrevista' : 'Registrar entrevista'}
        width={768}
        onClose={() => dispatch(setOpenDrawerFormPostulante(false))}
        open={openDrawerFormPostulante}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormContinuarAplicacion form={form} />
      </Drawer> */}

      {/* <Modal
        footer={null}
        maskClosable={false}  // Evita que se cierre al hacer clic fuera del modal
        keyboard={false}  // Evita que se cierre con la tecla Esc
        title="Firma de contrato"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}>
        <FormFirmarContrato form={formFirma} />
      </Modal> */}

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={6}>
          <Badge.Ribbon
            text={detalleDeSolicitud?.estatus || "---"}
            color={["Aceptado"].includes(detalleDeSolicitud?.estatus) ? "green" : ["Rechazado"].includes(detalleDeSolicitud?.estatus) ? "red" : "blue"}>
            <div style={{
              ...style,
              borderRadius: "1rem",
              background: "#f2f2f2",
              textAlign: "center",
              padding: screens.md ? "1rem" : "0.5rem",
              margin: "auto"
            }}>

              {Boolean(detalleDeSolicitud?.photoURL) ? <Image
                style={{ borderRadius: "1rem" }}
                width={150}
                src={detalleDeSolicitud?.photoURL}
              /> : <Avatar shape="square" size={150}><IdcardOutlined style={{ fontSize: "75px" }} /></Avatar>}

              <Title level={4} style={{ width: "100%" }}>
                {detalleDeSolicitud?.nombreCompleto}
              </Title>

              {/* <Badge
              status={["En entrevista", "En firma"].includes(detalleDeSolicitud?.estatus) ? "success" : "processing"}
              text={detalleDeSolicitud?.estatus || "---"} /> */}


              {/* <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text >{detalleDeSolicitud?.puesto?.toUpperCase()}</Text>
            </div> */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text >{detalleDeSolicitud?.id}</Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDeSolicitud?.telefono}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDeSolicitud?.email}</Text>
              </div>


              <Divider />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDeSolicitud?.direccion}</Text>
              </div>
              {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDeSolicitud?.fechaDeNacimiento}</Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text >{detalleDeSolicitud?.genero?.toUpperCase()}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text >{detalleDeSolicitud?.estadoCivil?.toUpperCase()}</Text>
              </div> */}

            </div>
          </Badge.Ribbon>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={16} lg={18} xl={18}>
          <div style={{
            ...style,
            /* borderRadius: "1rem", */
            /* background: "#f2f2f2", */
            textAlign: "left",
            padding: "0px",//screens.md ? "1rem" : "0.5rem",
            margin: "auto"
          }}>

            <Collapse
              defaultActiveKey={['1', '2', '3']}
              items={[
                {
                  key: '1',
                  label: (
                    <Text style={{ fontWeight: "bold",/*  fontSize: "1rem", */ textAlign: "left" }}>
                      Información general de la empresa
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Nombre</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.nombreDeLaEmpresa || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Razón social</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.giroDeLaEmpresa || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >RFC</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.rfc || "---"}
                            </Text>
                          </div>
                        </Col>

                      </Row>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Sector</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.giroDeLaEmpresa || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Número de empleados</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.numeroDeEmpleados || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Domicilio Fiscal</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.direccion || "---"}
                            </Text>
                          </div>
                        </Col>

                      </Row>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Inicio de operaciones</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.test || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Regímenes</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.test || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Régimen capital</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.test || "---"}
                            </Text>
                          </div>
                        </Col>

                      </Row>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Representante legal</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.nombre || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>

                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>

                        </Col>

                      </Row>
                    </>
                  )
                },
                {
                  key: '2',
                  label: (
                    <Text style={{ fontWeight: "bold",/*  fontSize: "1rem", */ textAlign: "left" }}>
                      Datos de contacto
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Dirección</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.direccion || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Teléfono</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.telefono || "---"}
                            </Text>
                          </div>
                        </Col>

                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Correo</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.email || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Representante legal</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeSolicitud?.nombre || "---"}
                            </Text>
                          </div>
                        </Col>

                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>

                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>

                        </Col>
                      </Row>

                    </>
                  )
                },
                {
                  key: '3',
                  label: (
                    <Text style={{ fontWeight: "bold",/*  fontSize: "1rem", */ textAlign: "left" }}>
                      Documentos
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

          {/* <Drawer
            title="Nuevo colaborador"
            width={768}
            onClose={() => dispatch(setOpenDrawer(false))}
            open={openDrawer}
            styles={{
              body: {
                paddingBottom: 80,
              },
            }}>
            <FormColaboradores form={formColaboradores} />
          </Drawer> */}
        </Col>
      </Row>
    </div>

  )
}

export default page;