import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Col,
  Collapse,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Form,
  Grid,
  Input,
  List,
  Row,
  Select,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import {
  UndoOutlined,
  SaveOutlined,
  PlusOutlined,
  UserAddOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setListaDeClientes, setListaTerminosDePago } from "@/features/ventasSlice";
import FireStoreVentas from "@/firebase/FireStoreVentas";
import DynamicTableVentas from "./DynamicTableVentas";
import StaticTableArticulos from "@/components/compras/compras/StaticTableArticulos";
import FormClientes from "../clientes/FormClientes";
import FormRutas from "@/components/logistica/rutas/FormRutas";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import { setListaDeUsuarios } from "@/features/recursosHumanosSlice";
import {
  setLoading,
  setOpenDrawer,
  setTotalDeLaVenta,
  setRefresh,
  setOpenDrawerRutas,
} from "@/features/finanzasSlice";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import Swal from "sweetalert2";

import { generateRandomString } from "@/helpers/functions";

const { useBreakpoint } = Grid;

interface RutaFiltrada {
  label: string;
  value: string;
  diasDeEntrega: string[];
  geofence: Array<{ lat: number; lng: number }>;
  horaDeSalida: string;
}

const uploadFilesEmpresaFB = async (file: any, clienteId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `ventasFiles/${clienteId}/${file?.name}`);
  try {
    // Subir imagen
    const { metadata } = await uploadBytes(storageRef, file, {
      contentType: file?.type,
    });
    const { bucket, contentType, name, fullPath } = metadata;
    // Obtener URL de descarga
    const imageUrl = await getDownloadURL(storageRef);
    return { url: imageUrl, bucket, contentType, name, fullPath };
  } catch (error) {
    throw error;
  }
};

// Opciones predefinidas para los campos de selección
const PAYMENT_METHODS = [
  { label: "Transferencia Bancaria", value: "Transferencia Bancaria" },
  { label: "Tarjeta de Crédito", value: "Tarjeta de Crédito" },
  { label: "Efectivo", value: "Efectivo" },
  { label: "Cheque", value: "Cheque" },
];
const SALE_CHANNELS = [
  { label: "Tienda física", value: "Tienda física" },
  { label: "En línea", value: "En línea" },
  { label: "Distribuidor", value: "Distribuidor" },
];

const style: React.CSSProperties = { width: "100%" };

const FormVentas = ({ form }: any) => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const [formPoliza] = Form.useForm();
  const [formCliente] = Form.useForm();
  const [formRuta] = Form.useForm();
  const [openDrawerCliente, setOpenDrawerCliente] = useState(false);
  const { newRutaId, openDrawerRutas } = useSelector(
    (state: any) => state.finanzas
  );

  // Valores iniciales y datos de ejemplo para los selects
  const {
    listaDeClientes = [],
    listaTerminosDePago,
    listaDeDescuentos,
    refresh,
    idNuevoCliente,
  } = useSelector((state: any) => state.ventas);
  const { auth } = useSelector((state: any) => state.configuracion);
  const { listaDeUsuarios = [] } = useSelector(
    (state: any) => state.recursosHumanos
  );

  const {
    loading,
    totalDeLaVenta = {},
    detalleDeVenta,
  } = useSelector((state: any) => state.finanzas);

  let totalDeTotales: any = Object.values(totalDeLaVenta);
  totalDeTotales = totalDeTotales
    .map((object: any) => {
      return Object.values(object);
    })
    .flat()
    .reduce((a: any, cv: any) => a + (cv?.subtotal || 0), 0);

  const [test, settest] = React.useState<any>({ factura: [] });

  const USUARIOS_RESPONSABLE = listaDeUsuarios.map((usuario: any) => {
    return {
      ...usuario,
      label: `${usuario?.nombres} ${usuario.apellidos}`,
      value: usuario?.id,
    };
  });

  const CLIENTES = listaDeClientes.map((cliente: any) => {
    return { ...cliente, label: cliente?.nombreCliente, value: cliente?.id };
  });

  // lista de polizas
  React.useEffect(() => {
    if (auth) {
      FireStoreVentas.listarSubCollectionEmpresa(
        auth?.empresa?.id,
        "terminos"
      ).then((listaDeTerminos: any) => {
        dispatch(setListaTerminosDePago(listaDeTerminos));
      });
    }
  }, [auth, refresh]);

  const TERMINOS = listaTerminosDePago.map((termino: any) => {
    return {
      ...termino,
      label: `${termino?.codigoTerminos} - ${termino?.descripcion}`,
      value: termino?.id,
    };
  });

  // lista de usuarios (colaboradores)
  React.useEffect(() => {
    if (auth) {
      FireStoreRecursosHumanos.listarUsuarios({
        idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
      }).then((listaDeUsuarios) => {
        dispatch(setListaDeUsuarios(listaDeUsuarios));
      });
    }
  }, [auth]);

  const DISCOUNT_POLICIES = listaDeDescuentos?.map((discount: any) => ({
    label: discount.nombre,
    value: discount.id,
  }));

  // Almacenar el cliente seleccionado para filtrar direcciones
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [rutasFiltradas, setRutasFiltradas] = useState<RutaFiltrada[]>([]);
  const [diasEntrega, setDiasEntrega] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    if (!newRutaId) return;
    if (!auth) return;
    const actualizarRutas = async () => {
      const rutas = await FireStoreFinanzas.listarRutas({
        idEmpresa: auth.empresa.id,
      });

      // Filtrar las rutas que pasan por alguna de las direcciones del cliente
      const rutasFiltradas: RutaFiltrada[] = rutas
        .filter((ruta: any) => ruta.estatus === true) // Solo rutas activas
        .map((ruta: any) => ({
          label: ruta.nombreDeRuta,
          value: ruta.id,
          diasDeEntrega: ruta.diasDeEntrega || [],
          geofence: ruta.geofence || [],
          horaDeSalida: ruta.horaDeSalida,
        }));
      setRutasFiltradas(rutasFiltradas);
    };

    form.setFieldsValue({ ruta: newRutaId });
    actualizarRutas();
  }, [newRutaId, form, setRutasFiltradas, auth]);

  // Función para obtener las rutas cuando se selecciona un cliente
  const handleClientChange = async (value: string) => {
    setSelectedClient(value);
    try {
      // Obtener todas las rutas
      const rutas = await FireStoreFinanzas.listarRutas({
        idEmpresa: auth.empresa.id,
      });

      // Obtener la dirección seleccionada del cliente
      const clienteSeleccionado = CLIENTES.find(
        (client: any) => client.value === value
      );

      // Filtrar las rutas que pasan por alguna de las direcciones del cliente
      const rutasFiltradas: RutaFiltrada[] = rutas
        .filter((ruta: any) => ruta.estatus === true) // Solo rutas activas
        .map((ruta: any) => ({
          label: ruta.nombreDeRuta,
          value: ruta.id,
          diasDeEntrega: ruta.diasDeEntrega || [],
          geofence: ruta.geofence || [],
          horaDeSalida: ruta.horaDeSalida,
        }))
        .filter((ruta: RutaFiltrada) => {
          // Verificar si alguna dirección del cliente está dentro del geofence de la ruta
          return clienteSeleccionado?.direcciones.some((direccion: any) => {
            const clienteLat = direccion.lat;
            const clienteLng = direccion.lng;

            // Verificar si el punto está dentro del polígono del geofence
            if (ruta.geofence && ruta.geofence.length > 0) {
              // Aquí podrías implementar la lógica para verificar si el punto está dentro del polígono
              // Por ahora retornamos true para mostrar todas las rutas
              return true;
            }
            return false;
          });
        });

      setRutasFiltradas(rutasFiltradas);
      // form.setFieldsValue({ ruta: undefined, diaEntrega: undefined });
    } catch (error) {
      console.error("Error al obtener rutas:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las rutas disponibles",
        icon: "error",
      });
    }
  };

  // Función para obtener los días de entrega cuando se selecciona una ruta
  const handleRutaChange = (value: string) => {
    const rutaSeleccionada = rutasFiltradas.find(
      (ruta) => ruta.value === value
    );
    if (rutaSeleccionada) {
      const diasDisponibles = (rutaSeleccionada.diasDeEntrega || []).map(
        (dia) => ({
          label: dia,
          value: dia,
        })
      );
      setDiasEntrega(diasDisponibles);

      // Mostrar la hora de salida
      if (rutaSeleccionada.horaDeSalida) {
        Swal.fire({
          title: "Información de la Ruta",
          text: `Hora de salida: ${rutaSeleccionada.horaDeSalida}`,
          icon: "info",
        });
      }
    } else {
      setDiasEntrega([]);
    }
    form.setFieldsValue({ diaEntrega: undefined });
  };

  // Función para manejar el envío del formulario
  const onFinish = async (values: any) => {
    try {
      const orderId = uuidv4();
      const [fechaRegistro] = new Date().toISOString().split("T");

      dispatch(setLoading(true));

      const articulosMap = Object.values(values?.articulos || []).map(
        (articulo: any) => {
          for (const key in articulo) articulo[key] = articulo[key] ?? "";
          return { ...articulo, id: articulo?.id || uuidv4() };
        }
      );

      if (detalleDeVenta?.id) {
        // UPDATE
        await FireStoreFinanzas.registrarVenta(auth?.empresa?.id, {
          ...values,
          fechaDeDespacho: values?.fechaDeDespacho
            ? values.fechaDeDespacho.format("YYYY-MM-DD")
            : fechaRegistro,
          articulos: [...(detalleDeVenta?.articulos || []), ...articulosMap],
          totalDeLaVenta: totalDeTotales,
          tipoDeVenta: "preventa", // Siempre será preventa
        });
      } else {
        // REGISTER
        await FireStoreFinanzas.registrarVenta(auth?.empresa?.id, {
          ...values,
          fechaDeDespacho: values?.fechaDeDespacho
            ? values.fechaDeDespacho.format("YYYY-MM-DD")
            : fechaRegistro,
          articulos: articulosMap,
          totalDeLaVenta: totalDeTotales,
          fechaRegistroDoc: fechaRegistro,
          estatus: "En revisión",
          tipoDeVenta: "preventa", // Siempre será preventa
        });
      }

      dispatch(setLoading(false));
      form.resetFields();
      dispatch(setOpenDrawer(false));
      dispatch(setTotalDeLaVenta({}));
      dispatch(setRefresh(Math.random())); // Forzar recarga de la lista

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Pre-venta ${
          detalleDeVenta?.id ? "actualizada" : "creada"
        } con éxito!`,
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      console.error("Error al guardar la pre-venta:", error);
      Swal.fire({
        title: "ERROR",
        text: error?.toString(),
        icon: "error",
      });
    }
  };

  // DETALLES Y TOTALES

  let DETALLES_Y_TOTALES: any = [
    [
      {
        key: `Total-de-la-venta`,
        label: <Typography.Text strong>Total de la venta</Typography.Text>,
        children: <Typography.Text strong>{totalDeTotales}</Typography.Text>, // totalDeLaCompra,
      },
    ],
  ];

  DETALLES_Y_TOTALES = DETALLES_Y_TOTALES.flat();

  // Efecto para cerrar el drawer y actualizar la lista cuando se crea un nuevo cliente
  React.useEffect(() => {
    if (idNuevoCliente) {
      setOpenDrawerCliente(false);
      formCliente.resetFields();
      // Seleccionar automáticamente el nuevo cliente
      form.setFieldsValue({ cliente: idNuevoCliente });
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
      handleClientChange(idNuevoCliente);
    }
  }, [idNuevoCliente]);

  // Efecto para cerrar el drawer y actualizar la lista cuando se crea una nueva ruta
  React.useEffect(() => {
    if (selectedClient) {
      // Actualizar la lista de rutas
      FireStoreFinanzas.listarRutas({ idEmpresa: auth.empresa.id })
        .then((rutas) => {
          const rutasFiltradas: RutaFiltrada[] = rutas
            .filter((ruta: any) => ruta.estatus === true)
            .map((ruta: any) => ({
              label: ruta.nombreDeRuta,
              value: ruta.id,
              diasDeEntrega: ruta.diasDeEntrega || [],
              geofence: ruta.geofence || [],
              horaDeSalida: ruta.horaDeSalida,
            }));
          setRutasFiltradas(rutasFiltradas);
        })
        .catch((error) => {
          console.error("Error al obtener rutas:", error);
        });
    }
  }, [selectedClient, refresh]);

  return (
    <Form
      form={form}
      name="create-order-form"
      layout="vertical"
      initialValues={{
        codigo: generateRandomString(),
        usuario: "",
        fechaDeDespacho: null,
        cliente: "",
        direccion: "",
        articulos: "",
        terminosDePago: "",
        metodoDePago: "",
        canalDeVenta: "",
        politicaDeDescuento: "",
        comentarios: "",
        solicitarFactura: false,
        ruta: null,
        // Removido tipoDeVenta ya que siempre será preventa
      }}
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col xs={24}>
          <Form.Item
            style={{ display: "none" }}
            name="codigo"
            label="Código"
            rules={[{ required: true, message: "Ingrese el código" }]}
          >
            <Input placeholder="Código de la orden" style={{ ...style }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="responsableDeLaVenta"
            label="Usuario responsable de la venta"
            rules={[
              {
                required: true,
                message: "Seleccione un responsable de la venta",
              },
            ]}
          >
            <Select
              options={USUARIOS_RESPONSABLE}
              placeholder="Seleccione responsable de la venta"
              style={style}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="cliente"
            label="Cliente"
            rules={[{ required: true, message: "Seleccione un cliente" }]}
          >
            <Select
              options={CLIENTES}
              placeholder="Seleccione un cliente"
              style={style}
              onChange={handleClientChange}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div style={{ padding: "4px 8px" }}>
                    <Button
                      type="dashed"
                      icon={<UserAddOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDrawerCliente(true);
                      }}
                      block
                      style={{
                        borderStyle: "dashed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Agregar Nuevo Cliente
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="ruta"
            label="Ruta"
            rules={[{ required: true, message: "Seleccione una ruta" }]}
          >
            <Select
              placeholder="Seleccione una ruta"
              style={style}
              options={rutasFiltradas}
              onChange={(value) => handleRutaChange(value)}
              disabled={!selectedClient}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div style={{ padding: "4px 8px" }}>
                    <Button
                      type="dashed"
                      icon={<EnvironmentOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setOpenDrawerRutas(true));
                      }}
                      block
                      style={{
                        borderStyle: "dashed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      disabled={!selectedClient}
                    >
                      Agregar Nueva Ruta
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="diaEntrega"
            label="Día de Entrega"
            rules={[
              { required: true, message: "Seleccione un día de entrega" },
            ]}
          >
            <Select
              placeholder="Seleccione el día de entrega"
              style={style}
              options={diasEntrega}
              disabled={!form.getFieldValue("ruta")}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[{ required: true, message: "Seleccione una dirección" }]}
          >
            <Select
              options={(
                CLIENTES.find((client: any) => client.value === selectedClient)
                  ?.direcciones || []
              ).map((address: any) => ({
                label: `${address.place} - ${address.tipoDireccion}`,
                value: `${address.place} - ${address.tipoDireccion}`,
              }))}
              placeholder="Seleccione una dirección"
              style={style}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={24} lg={24} xl={24}>
          {Boolean(detalleDeVenta?.id) && (
            <>
              <Collapse
                size="small"
                defaultActiveKey={[]}
                items={[
                  {
                    key: "1",
                    label: (
                      <Badge
                        offset={[15, 12]}
                        count={(detalleDeVenta?.articulos || [])?.length}
                      >
                        <Typography.Text strong>
                          {`Lista de artículos registrados`}
                        </Typography.Text>
                      </Badge>
                    ),
                    children: (
                      <StaticTableArticulos
                        dataSource={detalleDeVenta?.articulos || []}
                      />
                    ),
                  },
                ]}
              />
            </>
          )}
          <DynamicTableVentas form={form} clienteId={selectedClient} />
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24}>
          <Divider />
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24}>
          <Form.Item name="terminosDePago" label="Término de Pago">
            <Select
              options={TERMINOS}
              placeholder="Seleccione un término de pago"
              style={style}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="metodoDePago"
            label="Método de Pago"
            rules={[
              { required: true, message: "Seleccione un método de pago" },
            ]}
          >
            <Select
              options={PAYMENT_METHODS}
              placeholder="Seleccione un método de pago"
              style={style}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="canalDeVenta"
            label="Canal de Venta"
            rules={[
              { required: true, message: "Seleccione un canal de venta" },
            ]}
          >
            <Select
              options={SALE_CHANNELS}
              placeholder="Seleccione un canal de venta"
              style={style}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item name="politicaDeDescuento" label="Política de Descuento">
            <Select
              options={DISCOUNT_POLICIES}
              placeholder="Seleccione una política de descuento"
              style={style}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item name="comentarios" label="Comentarios">
            <Input.TextArea
              rows={3}
              placeholder="Ingrese comentarios adicionales"
              style={style}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              padding: "5px",
            }}
          >
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              style={{ color: "#0080ff" }}
            >
              Generar Factura
            </Button>
          </div>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={24} lg={24} xl={24}>
          <div
            style={{
              minWidth: screens.md ? "300px" : "600px",
              overflow: "auto",
            }}
          >
            <Descriptions
              size="small"
              column={1}
              bordered
              items={DETALLES_Y_TOTALES}
            />
          </div>
          <Divider />
        </Col>
      </Row>

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

      <Drawer
        title="Nuevo Cliente"
        width={screens.sm ? "50%" : "100%"}
        onClose={() => {
          setOpenDrawerCliente(false);
          formCliente.resetFields();
        }}
        open={openDrawerCliente}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <FormClientes form={formCliente} />
      </Drawer>
      <Drawer
        title="Nueva Ruta"
        width={screens.sm ? "50%" : "100%"}
        onClose={() => {
          dispatch(setOpenDrawerRutas(false));
          formRuta.resetFields();
        }}
        open={openDrawerRutas}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <FormRutas form={formRuta} />
      </Drawer>
    </Form>
  );
};

export default FormVentas;
