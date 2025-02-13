"use client";
import React, { useState } from 'react';
import { Col, Input, Row, Typography, Divider, Descriptions, Button, Card, Space, Tabs, Tooltip, Avatar, Form, Modal, Dropdown, MenuProps, List, Upload, Menu, Select, Checkbox, Flex, DatePicker } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { useDispatch, useSelector } from 'react-redux';
// import { setRefresh } from '@/features/administracionSlice';
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
  PaperClipOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EllipsisOutlined,
  UndoOutlined,
  SaveOutlined,
  FileSyncOutlined,
  FormOutlined
} from '@ant-design/icons';

import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import { setDetalleDeCompra, setRefresh, setListaDeComentarios } from '@/features/finanzasSlice';

import StaticTableArticulos from '@/components/compras/compras/StaticTableArticulos';
import MapWithRoute from '@/components/GoogleRoute';
import StaticTableGastos from '@/components/compras/compras/StaticTableGastos';
import { enviarEmail } from '@/helpers/email';
import Swal from 'sweetalert2';
import { CompraStatus } from '@/types/compras';
import dayjs from 'dayjs';
import DynamicTableArticulosOrdenados from '@/components/compras/ordenes-en-transito/DynamicTableArticulosOrdenados';


const style: React.CSSProperties = { width: '100%' };


const page = () => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { idCompra }: any = useParams();

  const [form] = Form.useForm();
  const [formTransito] = Form.useForm();

  const [loading, setloading] = React.useState(false);
  const [distance, setDistance] = React.useState('');
  const [duration, setDuration] = React.useState('');

  // Estados para manejar comentarios
  const [nuevoComentario, setNuevoComentario] = React.useState('');
  const [cargandoComentario, setCargandoComentario] = React.useState(false);

  //Estados para manejar el registro de entrada de las compras
  const [isModalRegistrarEntradaOpen, setIsModalRegistrarEntradaOpen] = React.useState(false);

  const {
    detalleDeCompra,
    refresh,
    listaDeComentarios
  } = useSelector((state: any) => state.finanzas);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    if (idCompra) {
      (async () => {
        const compra: any = await FireStoreFinanzas.buscarCompra(auth?.empresa?.id, idCompra);

        const proveedores = (compra?.articulos || []).map((articulo: any) => {
          return articulo?.proveedor;
        });

        const proveedoresUnicos = new Set(proveedores);
        const proveedoresUnicosArray: any[] = Array.from(proveedoresUnicos);

        let proveedoresResponse = await FireStoreFinanzas.listarProveedoresDeLaCompra(auth?.empresa?.id, proveedoresUnicosArray);
        proveedoresResponse = proveedoresResponse.map((proveedor: any) => {
          return { ...proveedor, articulos: compra?.articulos?.filter((articulo: any) => articulo?.proveedor == proveedor?.id) };
        });

        dispatch(setDetalleDeCompra({
          ...compra,
          proveedorPopulate: proveedoresResponse
        }));
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

  const [firstProveedor] = detalleDeCompra?.proveedorPopulate || [];
  const {
    nombreProveedor = "---",
    emailCompras = "---",
    telefonoContacto = "---",
    direcciones = []
  } = firstProveedor || {};

  const [firstDireccion = {}] = direcciones;

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
    if (idCompra && auth?.empresa?.id) {
      FireStoreFinanzas.listarComentarios(
        auth.empresa.id,
        idCompra
      ).then((comentarios: any) => {
        dispatch(setListaDeComentarios(comentarios));
      });
    }
  }, [idCompra, auth?.empresa?.id, dispatch]);

  // Función para agregar un comentario
  const agregarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    setCargandoComentario(true);
    try {
      console.log("auth: ", auth)
      const resultado = await FireStoreFinanzas.agregarComentario(
        auth.empresa.id,
        idCompra,
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
          idCompra
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
  const ComentariosList = () => (
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

  // HANDLER MODAL
  const correosUnicos = Array.from(new Set((detalleDeCompra?.proveedorPopulate || []).map((proveedor: any) => {
    return proveedor?.correoContacto || proveedor?.emailCompras || proveedor?.emailFacturacion
  })));
  const EMAIL_PROVEEDORES = correosUnicos.map((email: any) => {
    return {
      label: email,
      value: email
    };
  });


  const [isModalOpen, setIsModalOpen] = React.useState(false);
  useState

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const elementModal = (
    <Modal
      // loading
      title="Enviar correo a proveedor"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Aplicar"
      cancelText="Cerrar"
      footer={null}>
      <Form
        form={form}
        onValuesChange={(changedValues, allValues) => {

        }}
        name="create-catalog-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          enviarOrdenConSolicitudDeFactura: "",
          proveedor: correosUnicos,
        }}
        onFinish={async ({ proveedor, enviarOrdenConSolicitudDeFactura }) => {

          setloading(true);
          try {

            // buscamos responsable de la compra
            const findUsuario: any = await FireStoreRecursosHumanos.buscarUsuario(detalleDeCompra?.responsableDeLaCompra);            // Enviamos correo a los proveedores
            const emailsPromises = proveedor.map((emailProveedor: string) => {
              return enviarEmail({
                to: emailProveedor,
                subject: `Solicitud de Factura y Envío para Orden de Compra ${detalleDeCompra?.codigoCompra || ""}`,
                plantilla: "generarPlantillaHTMLSolicitudFactura",
                // informacion de la orden
                numeroOrden: detalleDeCompra?.codigoCompra || "",
                nombreProveedor: detalleDeCompra?.proveedorPopulate.map((proveedor: any) => proveedor?.nombreProveedor).join(', ') || "",
                productos: detalleDeCompra?.proveedorPopulate.reduce(
                  (acc: any, proveedor: any) => [...acc, ...proveedor?.articulos],
                  []
                ),
                nombreResponsable: `${findUsuario?.nombres || 'Desconocido'} ${findUsuario?.apellidos || 'Desconocido'}`,
                nombreEmpresa: auth?.empresa?.nombreDeLaEmpresa || "",
                // informacion de la solicitud
              });
            });
            await Promise.all(emailsPromises);
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Orden aprobada con éxito!`,
              showConfirmButton: false,
              timer: 3000
            });

            setloading(false);
            setIsModalOpen(false);
          } catch (error) {
            console.log(error);
            Swal.fire({
              title: "ERROR",
              text: error?.toString(),
              icon: "error"
            });
            setloading(false);
            setIsModalOpen(false);
          }
        }}>

        <Form.Item name="proveedor" label="Proveedor" rules={[{ required: true, message: 'Seleccione proveedor' }]}>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Tags Mode"
            // defaultValue={EMAIL_PROVEEDORES.map((proveedor: any) => proveedor.value)}
            // onChange={handleChange}
            options={EMAIL_PROVEEDORES}
          />
        </Form.Item>
        <Form.Item valuePropName="checked" name="enviarOrdenConSolicitudDeFactura">
          <Checkbox onChange={async (event: any) => {

          }} >¿Enviar orden con solicitud de factura?</Checkbox>
        </Form.Item>

        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
              <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset"> Limpiar </Button>
              <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit">Enviar</Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    </Modal >
  );


  const [isModalOpen2, setIsModalOpen2] = React.useState(false);

  const showModal2 = () => {
    setIsModalOpen2(true);
  };

  const handleOk2 = () => {
    setIsModalOpen2(false);
  };

  const handleCancel2 = () => {
    setIsModalOpen2(false);
  };
  const elementModalEnviarATransito = (
    <Modal
      // loading
      title="Información de envío"
      open={isModalOpen2}
      onOk={handleOk2}
      onCancel={handleCancel2}
      okText="Aplicar"
      cancelText="Cerrar"
      footer={null}>
      <Form
        form={formTransito}
        onValuesChange={(changedValues, allValues) => {

        }}
        name="create-catalog-form2"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          fechaEstimadaDeLlegada: "",
          guiaDeRastreo: [],
        }}
        onFinish={async ({ guiaDeRastreo, fechaEstimadaDeLlegada }) => {
          try {
            setloading(true);
            // Actualizamos ordenes y subOrdenes
            const subOrdenes = await FireStoreFinanzas.listarSubCompras(auth?.empresa?.id, detalleDeCompra?.id);

            const subOrdenesPromises = subOrdenes?.map((suborden: any) => {
              return FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                id: suborden?.id,
                estatus: CompraStatus.Transito,
                guiaDeRastreo,
                fechaEstimadaDeLlegada: dayjs(fechaEstimadaDeLlegada).format('YYYY-MM-DD'),
              });
            });
            await Promise.all([
              FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                id: detalleDeCompra?.id,
                estatus: CompraStatus.Transito,
                guiaDeRastreo,
                fechaEstimadaDeLlegada: dayjs(fechaEstimadaDeLlegada).format('YYYY-MM-DD'),
              }),
              ...subOrdenesPromises
            ]);

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Orden enviada a tránsito con éxito!`,
              showConfirmButton: false,
              timer: 3000
            });
            dispatch(setRefresh(Math.random()));
            setIsModalOpen2(false);
            setloading(false);
          } catch (error) {
            console.log('error', error);
            setloading(false);
            Swal.fire({
              title: "ERROR",
              text: error?.toString(),
              icon: "error"
            });
          }
        }}>
        <Form.Item name="fechaEstimadaDeLlegada" label="Fecha estimada de llegada del los productos" rules={[{ required: true, message: 'Seleccione fecha estimada de llegada' }]}>

          <DatePicker onChange={() => { }} style={style} />
        </Form.Item>

        <Form.Item name="guiaDeRastreo" label="Guía de rastreo" rules={[{ required: true, message: 'Seleccione guía de rastreo' }]}>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Tags Mode"
            // defaultValue={EMAIL_PROVEEDORES.map((proveedor: any) => proveedor.value)}
            // onChange={handleChange}
            options={[]}
          />
        </Form.Item>

        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
              <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset"> Limpiar </Button>
              <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit">Enviar</Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    </Modal >
  );


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
            <Space>
              <Col>
                <div style={{ width: "100%" }}>
                  {detalleDeCompra?.estatus === CompraStatus.Transito && (
                    <Button
                      icon={<FormOutlined />}
                      onClick={async() => {
                        setIsModalRegistrarEntradaOpen(true);
                      }}
                    >
                      Registrar entrada
                    </Button>
                  )}
                  {detalleDeCompra?.estatus === CompraStatus.Pendiente && (
                    <Button.Group>
                      <Button type="primary"
                        icon={<CheckCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                        onClick={async () => {

                          Swal.fire({
                            title: "Seguro de aprobar orden?",
                            text: "",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#1677ff",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Si",
                            cancelButtonText: "No"
                          }).then(async (result: any) => {
                            if (result.isConfirmed) {
                              try {
                                setloading(true);
                                // Actualizamos ordenes y subOrdenes
                                const subOrdenes = await FireStoreFinanzas.listarSubCompras(auth?.empresa?.id, detalleDeCompra?.id);

                                const subOrdenesPromises = subOrdenes?.map((suborden: any) => {
                                  return FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                                    id: suborden?.id,
                                    estatus: "Pendiente de información",
                                  });
                                });
                                await Promise.all([
                                  FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                                    id: detalleDeCompra?.id,
                                    estatus: "Pendiente de información",
                                  }),
                                  ...subOrdenesPromises
                                ]);

                                Swal.fire({
                                  position: "top-end",
                                  icon: "success",
                                  title: `Orden aprobada con éxito!`,
                                  showConfirmButton: false,
                                  timer: 3000
                                });
                                dispatch(setRefresh(Math.random()));
                                setloading(false);
                                showModal();
                              } catch (error) {
                                console.log('error', error);
                                setloading(false);
                                Swal.fire({
                                  title: "ERROR",
                                  text: error?.toString(),
                                  icon: "error"
                                });
                              }

                            }
                          });
                        }}
                        loading={loading}
                        disabled={false}>Aprobar orden</Button>

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
                              setloading(true);
                              // Actualizamos ordenes y subOrdenes
                              const subOrdenes = await FireStoreFinanzas.listarSubCompras(auth?.empresa?.id, detalleDeCompra?.id);

                              const subOrdenesPromises = subOrdenes?.map((suborden: any) => {
                                return FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                                  id: suborden?.id,
                                  estatus: CompraStatus.Rechazado,
                                  razonDeRechazo: text
                                });
                              });
                              await Promise.all([
                                FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                                  id: detalleDeCompra?.id,
                                  estatus: CompraStatus.Rechazado,
                                  razonDeRechazo: text
                                }),
                                ...subOrdenesPromises
                              ]);

                              // buscamos responsable de la compra
                              const findUsuario: any = await FireStoreRecursosHumanos.buscarUsuario(detalleDeCompra?.responsableDeLaCompra);            // Enviamos correo a los proveedores
                              const emailsPromises = correosUnicos.map((emailProveedor: any) => {
                                return enviarEmail({
                                  to: emailProveedor,
                                  subject: `Revisión Requerida: Orden de Compra ${detalleDeCompra?.codigoCompra || ""} Rechazada`,
                                  plantilla: "generarPlantillaHTMLRechazoOrdenCompra",
                                  // informacion de la orden
                                  numeroOrden: detalleDeCompra?.codigoCompra || "",
                                  nombreCreador: `${findUsuario?.nombres || 'Desconocido'} ${findUsuario?.apellidos || 'Desconocido'}`,
                                  razonRechazo: text,
                                  enlaceOrden: `${location.origin}/finanzas/compras/${detalleDeCompra?.id || idCompra}?cc=${detalleDeCompra?.codigoCompra}`,
                                  nombreEmpresa: auth?.empresa?.nombreDeLaEmpresa || "",
                                });
                              });
                              await Promise.all(emailsPromises);

                              dispatch(setRefresh(Math.random()));
                              Swal.fire({
                                title: "Orden rechazada con éxito!",
                                text: "",
                                icon: "success"
                              });
                              setloading(false);
                            }
                          } catch (error: any) {
                            console.log('error', error);
                            setloading(false);
                            Swal.fire({
                              title: "Error!",
                              text: error.toString(),
                              icon: "error"
                            });
                          }
                        }}
                        disabled={false}>Rechazar orden</Button>
                    </Button.Group>
                  )}
                  {detalleDeCompra?.estatus === CompraStatus.PendienteInformacion && (
                    <Button type="primary"
                      icon={<CheckCircleOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={async () => {

                        Swal.fire({
                          title: "Seguro de enviar a tránsito?",
                          text: "",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#1677ff",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Si",
                          cancelButtonText: "No"
                        }).then(async (result: any) => {
                          if (result.isConfirmed) {
                            showModal2();
                          }
                        });
                      }}
                      loading={loading}
                      disabled={false}>Enviar a tránsito</Button>
                  )}
                  {detalleDeCompra?.estatus === CompraStatus.Terminada && (
                    <Button type="primary"
                      icon={<FileSyncOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={async () => {

                        Swal.fire({
                          title: "Seguro de solicitar devolución?",
                          text: "",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#1677ff",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Si",
                          cancelButtonText: "No"
                        }).then(async (result: any) => {

                        });
                      }}
                      loading={loading}
                      disabled={false}>Solicitar devolución</Button>
                  )}
                  {detalleDeCompra?.estatus === CompraStatus.Incompleta && (
                    <Button type="primary"
                      icon={<FileSyncOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                      onClick={async () => {

                        /* Swal.fire({
                          title: "Seguro de solicitar devolución?",
                          text: "",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#1677ff",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Si",
                          cancelButtonText: "No"
                        }).then(async (result: any) => {
 
                        }); */
                      }}
                      loading={loading}
                      disabled={false}>Registrar  entrada</Button>
                  )}
                </div>
                {elementModal}
                {elementModalEnviarATransito}
              </Col>
              <Col xs={24}>
                <Tooltip title="Acciones">
                  <Dropdown
                    overlay={<Menu
                      items={items}
                    />}
                    trigger={["click"]}
                  >
                    <Button /* shape="circle" */ icon={<EllipsisOutlined />} />
                  </Dropdown>
                </Tooltip>
              </Col>
            </Space>
          </Col>
        </Row>
      </Space>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title="Información del Proveedor" style={{ ...style, height: "100%" }}>
            {/* <Typography.Title level={4}>Información del Proveedor</Typography.Title> */}

            {(detalleDeCompra?.proveedorPopulate || [])?.length == 1 ? (
              <>
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
              </>
            ) : (

              <Tabs
                // defaultActiveKey="1"
                tabPosition="top"
                type="card"
                style={{ height: "100%" }}
                items={detalleDeCompra?.proveedorPopulate?.map((proveedor: any, i: number) => {
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

          <Card title="Detalles de la Orden" style={{ ...style, height: "100%" }}>


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

        </Col>
      </Row>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Card title="Artículos" style={style}>
          {(detalleDeCompra?.proveedorPopulate || []).map((proveedor: any, index: number) => {
            return (
              <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24} key={index} style={{ marginBottom: "1rem" }}>
                <Typography.Title style={{ paddingBottom: "0.5rem" }} level={5}>{proveedor?.nombreProveedor}{/* , lista de artículos {(proveedor?.articulos || [])?.length} */} </Typography.Title>
                <StaticTableArticulos dataSource={proveedor?.articulos || []} showActions={false} />
              </Col>
            )
          })}
        </Card>
      </Row>

      {Boolean(detalleDeCompra?.gastosAdicionales?.length) && <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Card title="Gastos adicionales" style={style}>
          <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
            <StaticTableGastos dataSource={detalleDeCompra?.gastosAdicionales || []} showActions={false} />
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
            <Descriptions.Item label="Persona responsable">
              ${Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}
            </Descriptions.Item>
          </Descriptions>
          <Divider />
        </Col>
      </Row>

      <Row gutter={12} style={{ ...style/* , marginTop: "1rem"  */ }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card title="Comentarios" style={style}>

            <div style={{ maxHeight: "50vh", overflowY: "auto", margin: "1rem 0rem" }}>
              <ComentariosList />
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
      <Modal
        width={768}
        title="Registrar entrada"
        open={isModalRegistrarEntradaOpen}
        onOk={() => setIsModalRegistrarEntradaOpen(false)}
        onCancel={() => setIsModalRegistrarEntradaOpen(false)}
        okText="Aplicar"
        cancelText="Cerrar"
        footer={null}>
        <DynamicTableArticulosOrdenados/>
      </Modal>
    </div>

  )
}

export default page;