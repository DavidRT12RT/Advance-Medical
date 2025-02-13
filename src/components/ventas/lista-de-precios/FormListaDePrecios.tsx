"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Badge,
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  message,
  Row,
  Select,
  Modal,
  Tooltip,
  List,
  Progress,
  Typography,
  Drawer,
  Checkbox,
} from "antd";
import {
  UndoOutlined,
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setDetalleArticulos,
  setListaDeArticulos,
  setNewArticuloId,
  setOpenDrawerArticulo,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import FireStoreVentas from "@/firebase/FireStoreVentas";
import {
  setArticuloTemporal,
  setListaDeClientes,
  setModalInformacionDelArticulo,
  setLoading,
  setRefresh,
  setOpenDrawerListaDePrecios,
  setOpenDrawer,
  setPerfilClientes,
  setIdNuevoCliente,
} from "@/features/ventasSlice";
import { green } from "@ant-design/colors";
import FormArticulos from "@/components/inventario/articulos/FormArticulos";
import { generateRandomString, NumberFormatMXN } from "@/helpers/functions";
import FormInformacionDelArticulo from "./FormInformacionDelArticulo";
import FormClientes from "../clientes/FormClientes";

const style: React.CSSProperties = { width: "100%" };

const FormListaDePrecios = ({ form, isAgregarArticulos = false }: any) => {
  const dispatch = useDispatch();
  const [formClientes] = Form.useForm();
  const [formArticulos] = Form.useForm();
  const [formInformacionDelArticulo] = Form.useForm();

  const {
    listaDeArticulos = [],
    openDrawerArticulo,
    newArticuloId,
  } = useSelector((state: any) => state.inventario);

  const {
    listaDeClientes,
    articuloTemporal,
    modalInformacionDelArticulo,
    refresh,
    idNuevoCliente,
    loading,
    detalleDeListaDePrecios,
    perfilCliente,
    openDrawer,
  } = useSelector((state: any) => state.ventas);

  const { auth } = useSelector((state: any) => state.configuracion);
  const [selectedArticulos, setSelectedArticulos] = useState<any[]>([]);

  const ARTICULOS = listaDeArticulos
    .filter((articulo: any) => {
      const findArticulo = selectedArticulos.find(
        (selectedArticulo: any) => selectedArticulo?.id == articulo?.id
      );
      return findArticulo ? false : true;
    })
    .map((articulo: any) => {
      return {
        ...articulo,
        label: `${articulo?.codigoArticulo} - ${articulo?.descripcion}`,
        value: articulo?.id,
      };
    });

  React.useEffect(() => {
    if (articuloTemporal && articuloTemporal?.informacionDelArticulo) {
      // articuloTemporal?.informacionDelArticulo
      // la informacion del form de informacion del articulo se asocio al articulo temporal
      setSelectedArticulos((oldData: any) => [...oldData, articuloTemporal]);
      dispatch(setArticuloTemporal(null));
    }
  }, [articuloTemporal]);

  React.useEffect(() => {
    if (detalleDeListaDePrecios) {
      setSelectedArticulos((oldData: any) => [
        ...oldData,
        ...detalleDeListaDePrecios?.articulos,
      ]);
    }

    return () => {
      setSelectedArticulos([]);
    };
  }, [detalleDeListaDePrecios]);

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreInventario.listarArticulos({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeArticulos) => {
        dispatch(setListaDeArticulos(listaDeArticulos));
      });
    }
  }, [auth /* , refresh */]);

  React.useEffect(() => {
    if (auth?.empresa || (auth?.empresa && idNuevoCliente)) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth, idNuevoCliente]);

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreInventario.listarArticulos({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeArticulos) =>
        dispatch(setListaDeArticulos(listaDeArticulos))
      );
    }
  }, [auth, newArticuloId]);

  const CLIENTES = listaDeClientes.map((cliente: any) => {
    return { ...cliente, label: cliente?.nombreCliente, value: cliente?.id };
  });

  // AL REGISTRAR UN NUEVO CLIENTE AGREGAMOS ESE CLIENTE AL SELECT MULTIPLE
  React.useEffect(() => {
    if (idNuevoCliente) {
      setTimeout(() => {
        dispatch(setIdNuevoCliente(null));
        const idsClientes = form.getFieldValue("clientes") || [];
        form.setFieldValue("clientes", [...idsClientes, idNuevoCliente]);
      }, 600);
    }
  }, [listaDeClientes, idNuevoCliente]);

  // AL REGISTRAR UN NUEVO ARTICULO AGREGAMOS ESE CLIENTE AL SELECT Cortesia de David AM😉
  React.useEffect(() => {
    if (newArticuloId) {
      setTimeout(() => {
        form.setFieldValue("articulo", newArticuloId);

        const findArticulo = listaDeArticulos.find(
          (articulo: any) => articulo?.id == newArticuloId
        );
        dispatch(setArticuloTemporal(findArticulo));
        dispatch(setModalInformacionDelArticulo(true));
        dispatch(setNewArticuloId(null));
      }, 600);
    }
  }, [listaDeArticulos, newArticuloId]);

  const handleArticuloSelect = (value: string) => {
    const findArticulo = listaDeArticulos.find(
      (articulo: any) => articulo?.id == value
    );
    if (findArticulo) {
      dispatch(setArticuloTemporal(findArticulo));
      dispatch(setModalInformacionDelArticulo(true));
    }
  };

  return (
    <>
      <Form
        form={form}
        name="create-catalog-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          nombreDeLaListaDePrecios: "",
          articulo: "",
          clientes: [],
          estatus: true,
        }}
        onFinish={async (values) => {
          try {
            // if (!Boolean(selectedArticulos.length)) {
            //   return await Swal.fire({
            //     title: "Seleccione al menos un artículo",
            //     text: "",
            //     icon: "warning",
            //   });
            // }

            dispatch(setLoading(true));

            const [fechaRegistro] = new Date().toISOString().split("T");
            // Registrar el catalogo en Firestore
            await FireStoreVentas.registrarListaDePrecios(auth?.empresa?.id, {
              id: values?.id || "",
              nombreDeLaListaDePrecios: values?.nombreDeLaListaDePrecios || "",
              codigoDeLaListaDePrecios:
                detalleDeListaDePrecios?.codigoDeLaListaDePrecios ||
                generateRandomString(),
              articulos: selectedArticulos || values?.articulos || [],
              fechaRegistroDoc:
                detalleDeListaDePrecios?.fechaRegistroDoc || fechaRegistro,
              clientes: values?.clientes || [],
              estatus: values?.estatus,
            });

            setSelectedArticulos([]);
            dispatch(setLoading(false));
            dispatch(setOpenDrawerArticulo(false));
            dispatch(setOpenDrawerListaDePrecios(false));
            dispatch(setRefresh(Math.random()));
            form.resetFields();

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Lista de precios ${
                false ? "actualizada" : "registrada"
              } con éxito!`,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error: any) {
            console.log("error", error);
            Swal.fire({
              title: "ERROR",
              text: error?.toString(),
              icon: "error",
            });
          }
        }}
      >
        <Row gutter={12}>
          <Divider orientation="left">
            Información de la lista de precios
          </Divider>

          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: "Ingrese Id" }]}
          >
            <Input placeholder="Ingrese Id" style={style} />
          </Form.Item>

          {/* Campo para el nombre del catálogo */}
          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item
              name="nombreDeLaListaDePrecios"
              label="Nombre de la lista de precios"
              rules={[
                {
                  required: true,
                  message: "Ingrese el nombre de la lista de precios",
                },
              ]}
            >
              <Input
                disabled={isAgregarArticulos}
                placeholder="Ingrese el nombre de la lista de precios"
                style={style}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item
              name="clientes"
              label="Clientes"
              rules={[{ required: true, message: "Seleccione clientes" }]}
            >
              <Select
                disabled={isAgregarArticulos}
                options={CLIENTES}
                style={style}
                placeholder="Seleccione clientes"
                onChange={() => {}}
                mode="multiple"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      block
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        // Abrir el formulario de registrar articulos
                        formClientes.resetFields();
                        dispatch(setPerfilClientes(null));
                        dispatch(setOpenDrawer(true));
                      }}
                    >
                      Nuevo cliente
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          {/* Campo de selección de artículo */}
          <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item
              name="articulo"
              label="Artículos"
              rules={[{ required: false, message: "Seleccione artículos" }]}
            >
              <Select
                options={ARTICULOS}
                placeholder="Seleccione artículos"
                style={{ flex: 1 }}
                showSearch
                optionFilterProp="label"
                onChange={handleArticuloSelect}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      block
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        // Abrir el formulario de registrar articulos
                        formArticulos.resetFields();
                        dispatch(setDetalleArticulos(null));
                        dispatch(setOpenDrawerArticulo(true));
                      }}
                    >
                      Nuevo articulo
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} lg={24} xl={24}>
            {Boolean((selectedArticulos || []).length) && (
              <List
                size="small"
                header={
                  <Badge
                    offset={[15, 12]}
                    count={(selectedArticulos || []).length}
                  >
                    <Typography.Text strong>Lista de artículos</Typography.Text>
                  </Badge>
                }
                footer={null}
                bordered
                dataSource={selectedArticulos || []}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Eliminar">
                        <Button
                          type="dashed"
                          shape="circle"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: "Seguro de eliminar articulo?",
                              text: `La información del artículo "${item?.descripcion}" se perdera`,
                              icon: "question",
                              showCancelButton: true,
                              confirmButtonColor: "#1677ff",
                              cancelButtonColor: "#d33",
                              confirmButtonText: "Si",
                              cancelButtonText: "No",
                            });

                            if (result.isConfirmed) {
                              console.log("item", item);
                              form.setFieldValue("articulo", undefined);
                              setSelectedArticulos((oldData: any) => [
                                ...oldData?.filter(
                                  (articulo: any) => articulo?.id !== item?.id
                                ),
                              ]);
                            }
                          }}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      title={`${item?.codigoArticulo} - ${item?.descripcion}`}
                      description={
                        <Typography.Text strong>
                          Precio de venta:{" "}
                          {NumberFormatMXN(
                            item?.informacionDelArticulo?.precioDeVenta
                          )}
                        </Typography.Text>
                      }
                    />
                    <Progress
                      percent={100}
                      steps={5}
                      size="small"
                      strokeColor={green[6]}
                    />
                  </List.Item>
                )}
              />
            )}
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              valuePropName="checked"
              name="estatus"
              rules={[{ required: false, message: "" }]}
            >
              <Checkbox disabled={isAgregarArticulos}>Estatus inicial</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Botones de acción */}
        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: "50%", margin: "auto" }}>
              <Button
                loading={loading}
                icon={<UndoOutlined />}
                danger
                type="primary"
                block
                htmlType="reset"
              >
                {" "}
                Limpiar{" "}
              </Button>
              <Button
                loading={loading}
                icon={<SaveOutlined />}
                type="primary"
                block
                htmlType="submit"
              >
                {" "}
                Guardar{" "}
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Drawer
        title={perfilCliente?.id ? "Editar cliente" : "Nuevo cliente"}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilCliente?.id ? "orange" : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        <FormClientes form={formClientes} />
      </Drawer>

      <Drawer
        title={"Nuevo artículo"}
        width={768}
        onClose={() => dispatch(setOpenDrawerArticulo(false))}
        open={openDrawerArticulo}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <FormArticulos form={formArticulos} />
      </Drawer>

      <Modal
        title={`Detalles del artículo`}
        open={modalInformacionDelArticulo}
        maskClosable={false} // Evita el cierre al hacer clic fuera del modal
        footer={null} // Oculta los botones de "Cancelar" y "OK"
        onCancel={() => {
          dispatch(setModalInformacionDelArticulo(false));
          form.setFieldValue("articulo", undefined);
        }}
      >
        <FormInformacionDelArticulo form={formInformacionDelArticulo} />
      </Modal>
    </>
  );
};

export default FormListaDePrecios;
