"use client";
import React from 'react';
import { Col, Input, Row, Image, Typography, Divider, DescriptionsProps, Descriptions, Button, Card, Space, Tabs, Tooltip, Grid, Collapse, Avatar, Badge, Drawer, Form, Modal } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { useDispatch, useSelector } from 'react-redux';
import { setDetalleDeContratacion, setDetalleDelPostulante, setIsModalOpen, setOpenDrawer, setOpenDrawerFormPostulante, setPerfilUsuario, setRefresh } from '@/features/recursosHumanosSlice';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CloudDownloadOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  FormOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import FormContinuarAplicacion from '@/components/recursos-humanos/contrataciones/FormContinuarAplicacion';
import { enviarEmail } from '@/helpers/email';
import moment from 'moment';
import FormFirmarContrato from '@/components/recursos-humanos/contrataciones/FormFirmarContrato';
import FormColaboradores from '@/components/recursos-humanos/colaboradores/FormColaboradores';

const RAZONES_DE_RECHAZO: any = {
  FaltaExperiencia: "Falta de experiencia relevante para el puesto",
  RequisitosEducativos: "No cumple con los requisitos educativos mínimos",
  DocumentosRequeridos: "No completó todos los documentos requeridos",
  HorarioNoCompatible: "Disponibilidad de horario no compatible",
  ExpectativasSalariales: "Expectativas salariales fuera del rango ofrecido",
  PruebasPsicometricas: "No pasó las pruebas psicométricas",
  NoAsistioEntrevista: "No asistió a la entrevista",
  NoAjustaPerfil: "No se ajusta al perfil buscado para el puesto",
};


const { Search } = Input;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const style: React.CSSProperties = { width: '100%' };


const page = () => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { idContratacion, idPostulante } = useParams();
  const screens = useBreakpoint();

  const [form] = Form.useForm();
  const [formFirma] = Form.useForm();
  const [formColaboradores] = Form.useForm();

  const {
    detalleDelPostulante,
    detalleDeContratacion,
    openDrawerFormPostulante,
    refresh,
    isModalOpen,
    openDrawer
  } = useSelector((state: any) => state.recursosHumanos);
  console.log('detalleDelPostulante', detalleDelPostulante);


  React.useEffect(() => {
    if (idContratacion && idPostulante) {
      (async () => {
        const postulante = await FireStoreRecursosHumanos.buscarPostulante(idContratacion, idPostulante);
        dispatch(setDetalleDelPostulante(postulante));
        const contratacion = await FireStoreRecursosHumanos.buscarContratacion(idContratacion);
        dispatch(setDetalleDeContratacion(contratacion));
      })();
    }
  }, [idContratacion, idPostulante, refresh]);

  let DOCUMENTOS_SOLICITADOS = (detalleDelPostulante?.documentos || [])
    .map((doc: any, index: number) => {
      return [
        {
          key: String((index + 1)),
          label: "Documento",
          children: doc?.documento || "---",
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
        {
          key: String((index + 1)),
          label: "Acciones",
          children: (
            <Button.Group>
              <Button
                disabled={["Rechazado", "En entrevista", "En firma"].includes(detalleDelPostulante?.estatus)}
                onClick={async () => {
                  await FireStoreRecursosHumanos.agregarPostulanteContratacion(
                    detalleDeContratacion?.id,
                    detalleDelPostulante?.id,
                    {
                      documentos: detalleDelPostulante?.documentos.map((documento: any) => {
                        return {
                          ...documento,
                          estatus: documento?.fullPath == doc?.fullPath
                            ? "Aceptado"
                            : documento?.estatus
                        }
                      })
                    }
                  );

                  dispatch(setRefresh(Math.random()));

                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: `Documento aceptado con éxito!`,
                    showConfirmButton: false,
                    timer: 3000
                  });
                }}
                type="primary"
                icon={<CheckOutlined />}>Aceptar</Button>
              <Button
                disabled={["Rechazado", "En entrevista", "En firma"].includes(detalleDelPostulante?.estatus)}
                onClick={async () => {
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

                    await FireStoreRecursosHumanos.agregarPostulanteContratacion(
                      detalleDeContratacion?.id,
                      detalleDelPostulante?.id,
                      {
                        documentos: detalleDelPostulante?.documentos.map((documento: any) => {
                          return {
                            ...documento,
                            estatus: documento?.fullPath == doc?.fullPath
                              ? "Rechazado"
                              : documento?.estatus,
                            razonDelRechazo: text
                          }
                        })
                      }
                    );

                    dispatch(setRefresh(Math.random()));

                    Swal.fire({
                      position: "top-end",
                      icon: "success",
                      title: `Documento rechazado con éxito!`,
                      showConfirmButton: false,
                      timer: 3000
                    });
                  }

                }}
                danger
                type="primary"
                icon={<DeleteOutlined />}>Rechazar</Button>
            </Button.Group>
          ),
        }
      ]
    });

  DOCUMENTOS_SOLICITADOS = DOCUMENTOS_SOLICITADOS.flat();

  const ESTATUS_POSTULANTE = detalleDelPostulante?.estatus;

  // HANDLER MODAL FIRMAR CONTRATO

  const showModal = () => {
    dispatch(setIsModalOpen(true));
  };

  const handleOk = () => {
    dispatch(setIsModalOpen(false));
  };

  const handleCancel = () => {
    dispatch(setIsModalOpen(false));
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
                <Title level={4} style={{ marginBottom: '0px' }}>
                  Perfil completo del postulante
                </Title>
              </Col>
            </Space>
          </Col>
          <Col>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <Button.Group>
                {["En revisión", "Rechazado"].includes(ESTATUS_POSTULANTE) && (
                  <>
                    <Button type="primary"
                      icon={<CheckCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={() => {
                        form.resetFields();
                        dispatch(setOpenDrawerFormPostulante(true));
                      }}
                      disabled={["Rechazado"].includes(ESTATUS_POSTULANTE)}>Continuar aplicación</Button>

                    <Button type="primary"
                      danger
                      icon={<CloseCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={async () => {
                        const { value: razonSeleccionada } = await Swal.fire({
                          title: "Seleccione motivo del rechazo",
                          input: "select",
                          inputOptions: RAZONES_DE_RECHAZO,
                          inputPlaceholder: "Seleccione motivo del rechazo",
                          showCancelButton: true,
                          confirmButtonText: "Enviar",  // Cambia el texto del botón de confirmación
                          cancelButtonText: "Cancelar", // Cambia el texto del botón de cancelación
                          confirmButtonColor: '#1677ff', // Color del botón OK
                          cancelButtonColor: '#ff4d4f',    // Color del botón Cancelar
                          inputValidator: (value) => {
                            return new Promise((resolve) => {
                              if (!value) {
                                // Si no se ha seleccionado nada
                                resolve("Seleccione motivo del rechazo");
                              } else {
                                // Aquí puedes añadir más validaciones si es necesario
                                resolve(); // Aceptar si se seleccionó un valor válido
                              }
                            });
                          }
                        });
                        if (razonSeleccionada) {

                          await enviarEmail({
                            to: detalleDelPostulante?.email,
                            subject: "Notificación sobre tu candidatura",
                            plantilla: "generarPlantillaHTMLRechazo",
                            nombrePostulante: detalleDelPostulante?.nombreCompleto || "",
                            nombrePuesto: detalleDeContratacion?.nombreDelPuesto || "",
                            nombreEmpresa: "smartroute",
                            razonSeleccionada: RAZONES_DE_RECHAZO[razonSeleccionada],
                            nombreEncargado: (detalleDeContratacion?.personasResponsables || [])
                              .map(({ nombres, apellidos }: any) => {
                                return `${nombres} ${apellidos}`;
                              }).toString(),
                          });

                          Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: `Mensaje enviado con éxito!`,
                            showConfirmButton: false,
                            timer: 3000
                          });

                        }
                      }}
                      disabled={["Rechazado"].includes(ESTATUS_POSTULANTE)}>Rechazar postulante</Button>
                  </>
                )}

                {["En entrevista"].includes(ESTATUS_POSTULANTE) && (
                  <>
                    <Button type="primary"
                      icon={<CheckCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={() => {
                        showModal();
                      }}
                      disabled={["Rechazado"].includes(ESTATUS_POSTULANTE)}>Firma de contrato</Button>
                    <Button type="primary"
                      danger
                      icon={<FormOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={() => {
                        dispatch(setOpenDrawerFormPostulante(true));
                        form.resetFields();
                        form.setFieldsValue({
                          ...detalleDelPostulante?.entrevista,
                          fecha: moment(detalleDelPostulante?.entrevista?.fecha, "YYYY-MM-DD"),
                          hora: moment(detalleDelPostulante?.entrevista?.hora, 'HH:mm:ss')
                        });
                      }}
                      disabled={false}>Editar entrevista</Button>
                  </>
                )}

                {["En firma"].includes(ESTATUS_POSTULANTE) && (
                  <>
                    <Button type="primary"
                      icon={<CheckCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={() => {
                        formColaboradores.resetFields();
                        const {
                          // Información general
                          nombreCompleto,
                          telefono,
                          email,
                          direccion,
                          fechaDeNacimiento,
                          genero,
                          estadoCivil,
                          // Información de empleo
                          curp,
                          rfc,
                        } = detalleDelPostulante;

                        const [nombres, ...apellidos] = nombreCompleto.split(" ");

                        formColaboradores.setFieldsValue({
                          id: "",
                          // Información general
                          nombres: nombres?.trim(),
                          apellidos: apellidos.join(" ").trim(),
                          telefono,
                          email,
                          direccion,
                          fechaNacimiento: moment(fechaDeNacimiento, "YYYY-MM-DD"),
                          genero,
                          estadoCivil,
                          // Información de empleo
                          puesto: "",
                          estatusActual: "",
                          numeroDeSeguroSocial: "",
                          curp,
                          rfc,
                          sucursal: "",
                          fechaRegistroIngreso: "",
                          fechaDeContrato: "",
                          tipoDeContrato: "",
                          duracionDelContrato: "",
                          fechaDeFinalizacionDelContrato: "",
                          supervisorOGerenteAsignado: "",
                          // Nomina(Opcional)
                          salarioBase: "",
                          tipoDePago: "",
                          claveBancaria: "",
                          deducciones: "",
                          bonificaciones: "",
                          comisiones: "",
                          prestacionesAdicionales: "",
                          // Información para vacaciones: (Opcional)
                          diasDeVacionesAsignados: "",
                          // firebaseUID
                          firebaseUID: "",
                          photoURL: "",
                        });
                        dispatch(setOpenDrawer(true));
                      }}
                      disabled={["Rechazado"].includes(ESTATUS_POSTULANTE)}>Contratar postulante</Button>
                  </>
                )}

              </Button.Group>
            </div>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={detalleDelPostulante?.entrevista?.id ? 'Editar entrevista' : 'Registrar entrevista'}
        width={768}
        onClose={() => dispatch(setOpenDrawerFormPostulante(false))}
        open={openDrawerFormPostulante}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormContinuarAplicacion form={form} />
      </Drawer>

      <Modal
        footer={null}
        maskClosable={false}  // Evita que se cierre al hacer clic fuera del modal
        keyboard={false}  // Evita que se cierre con la tecla Esc
        title="Firma de contrato"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}>
        <FormFirmarContrato form={formFirma} />
      </Modal>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={6}>
          <Badge.Ribbon
            text={detalleDelPostulante?.estatus || "---"}
            color={["En entrevista", "En firma"].includes(detalleDelPostulante?.estatus) ? "green" : "blue"}>
            <div style={{
              ...style,
              borderRadius: "1rem",
              background: "#f2f2f2",
              textAlign: "center",
              padding: screens.md ? "1rem" : "0.5rem",
              margin: "auto"
            }}>

              {Boolean(detalleDelPostulante?.photoURL) ? <Image
                style={{ borderRadius: "1rem" }}
                width={150}
                src={detalleDelPostulante?.photoURL}
              /> : <Avatar shape="square" size={150}><UserOutlined style={{ fontSize: "75px" }} /></Avatar>}

              <Title level={4} style={{ width: "100%" }}>
                {detalleDelPostulante?.nombreCompleto}
              </Title>

              {/* <Badge
              status={["En entrevista", "En firma"].includes(detalleDelPostulante?.estatus) ? "success" : "processing"}
              text={detalleDelPostulante?.estatus || "---"} /> */}


              {/* <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text >{detalleDelPostulante?.puesto?.toUpperCase()}</Text>
            </div> */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text >{detalleDelPostulante?.id}</Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDelPostulante?.telefono}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDelPostulante?.email}</Text>
              </div>


              <Divider />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDelPostulante?.direccion}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text >{detalleDelPostulante?.fechaDeNacimiento}</Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text >{detalleDelPostulante?.genero?.toUpperCase()}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text >{detalleDelPostulante?.estadoCivil?.toUpperCase()}</Text>
              </div>

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
                      Información del postulante
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Número de seguro social</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.numeroDeSeguroSocial || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >CURP</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.curp || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >RFC</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.rfc || "---"}
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
                    <Text style={{ fontWeight: "bold",/*  fontSize: "1rem", */ textAlign: "left" }}>
                      Referencias
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Nombres</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.nombresRef1 || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Teléfono</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.telefonoRef1 || "---"}
                            </Text>
                          </div>
                        </Col>

                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Nombres</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.nombresRef2 || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Teléfono</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.telefonoRef2 || "---"}
                            </Text>
                          </div>
                        </Col>

                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Nombres</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.nombresRef3 || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text >Teléfono</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDelPostulante?.telefonoRef3 || "---"}
                            </Text>
                          </div>
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

          <Drawer
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
          </Drawer>
        </Col>
      </Row>
    </div>

  )
}

export default page;