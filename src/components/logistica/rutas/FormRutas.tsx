import {
  Button,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  TimePicker,
  Tooltip,
} from "antd";
import * as React from "react";
import Swal from "sweetalert2";
import { UndoOutlined, SaveOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "../../../app/rutas.css";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import {
  setLoading,
  setNewRutaId,
  setOpenDrawerRutas,
  setRefresh,
  setRefreshSubCollection,
} from "@/features/finanzasSlice";
import RouteOptimizer from "./RouteOptimizer";
import GeofenceMap from "./GeofenceMap";
import {
  setListaDeUsuarios,
  setOpenDrawer,
  setPerfilUsuario,
} from "@/features/recursosHumanosSlice";
import {
  setIdNuevoCliente,
  setListaDeClientes,
  setOpenDrawer as setOpenDrawerVentas,
  setPerfilClientes,
} from "@/features/ventasSlice";
import FormColaboradores from "@/components/recursos-humanos/colaboradores/FormColaboradores";
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import { setListaDeSucursales } from "@/features/configuracionSlice";
import FormClientes from "@/components/ventas/clientes/FormClientes";
import FireStoreVentas from "@/firebase/FireStoreVentas";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";

dayjs.extend(customParseFormat);

const style: React.CSSProperties = { width: "100%" };

const TIPO_DE_RUTA = [
  { label: "Geofence", value: "Geofence" },
  { label: "Clientes", value: "Clientes" },
];

const DIAS_DE_ENTREGA = [
  { label: "Lunes", value: "Lunes" },
  { label: "Martes", value: "Martes" },
  { label: "Miércoles", value: "Miércoles" },
  { label: "Jueves", value: "Jueves" },
  { label: "Viernes", value: "Viernes" },
  { label: "Sábado", value: "Sábado" },
  { label: "Domingo", value: "Domingo" },
];

const FRECUENCIA_DE_ENTREGA = [
  { label: "7 Días", value: "7 Días" },
  { label: "14 Días", value: "14 Días" },
  { label: "21 Días", value: "21 Días" },
  { label: "28 Días", value: "28 Días" },
];

const FormRutas = ({ form }: any) => {
  const dispatch = useDispatch();

  const [formColaboradores]: any = Form.useForm();
  const [formClientes]: any = Form.useForm();

  const { listaDeUsuarios, perfilUsuario, openDrawer } = useSelector(
    (state: any) => state.recursosHumanos
  );

  const { refresh } = useSelector((state: any) => state.recursosHumanos);
  const { auth } = useSelector((state: any) => state.configuracion);

  const {
    openDrawer: openDrawerVentas,
    perfilCliente,
    listaDeClientes = [],
    idNuevoCliente,
  } = useSelector((state: any) => state.ventas);

  const { loading, detalleDeRuta } = useSelector(
    (state: any) => state.finanzas
  );

  const [tipoDeRuta, setTipoDeRuta] = React.useState("");
  const [clientesMap, setClientesMap] = React.useState<any[]>([]);
  const [geofenceCoordinates, setGeofenceCoordinates] = React.useState<
    { lat: number; lng: number }[]
  >([]);
  const [clientesSeleccionados, setClientesSeleccionados] = React.useState<
    any[]
  >([]);

  // Cargamos los colaboradores tipos chofer
  React.useEffect(() => {
    console.log("Entramos a recargar los colaboradores de tipo chofer");
    if (auth?.empresa) {
      FireStoreRecursosHumanos.listarUsuarios({
        idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
      }).then((listaDeUsuarios) => {
        dispatch(setListaDeUsuarios(listaDeUsuarios));
      });
    }
  }, [auth, refresh]);

  // Lista de clientes
  React.useEffect(() => {
    if (auth?.empresa || (auth?.empresa && idNuevoCliente)) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth, idNuevoCliente]);

  const handleGeofenceComplete = (
    coordinates: { lat: number; lng: number }[]
  ) => {
    setGeofenceCoordinates(coordinates);
    form.setFieldsValue({ geofence: coordinates });
  };

  const handleLocationsInPolygon = (locationsInside: any[]) => {
    const keys = locationsInside.map((location: any) => location.id);
    setSelectedRowKeys(keys);
    setClientesSeleccionados(locationsInside);
  };

  const CLIENTES = listaDeClientes.map((cliente: any) => {
    return { ...cliente, label: cliente?.nombreCliente, value: cliente?.id };
  });

  React.useEffect(() => {
    const arrayUbicaciones: any[] = [];
    listaDeClientes.forEach(({ direcciones = [], ...cliente }: any) => {
      direcciones.forEach((direccion: any) => {
        arrayUbicaciones.push({
          lat: direccion?.lat,
          lng: direccion?.lng,
          place: direccion?.place,
          tipoDireccion: direccion?.tipoDireccion,
          ...cliente,
        });
      });
    });

    setClientesMap(arrayUbicaciones);
  }, [listaDeClientes]);

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([]);
  // filtrar por empresa
  const COLABORADORES_CHOFER = listaDeUsuarios
    .filter((colaborador: any) => colaborador?.puesto === "Chofer")
    .map((usuario: any) => {
      return {
        ...usuario,
        label: `${usuario?.nombres} ${usuario?.apellidos}`,
        value: usuario?.id,
      };
    });

  React.useEffect(() => {
    if (detalleDeRuta) {
      setTipoDeRuta(detalleDeRuta?.tipoDeRuta);
      setGeofenceCoordinates(detalleDeRuta?.geofence || []);

      const arrayClientes: any[] = [];
      (detalleDeRuta?.clientesSeleccionadosEnGeofence || []).forEach(
        ({ direcciones = [], ...cliente }: any) => {
          direcciones.forEach((direccion: any) => {
            arrayClientes.push({
              lat: direccion?.lat,
              lng: direccion?.lng,
              place: direccion?.place,
              tipoDireccion: direccion?.tipoDireccion,
              ...cliente,
            });
          });
        }
      );
      setClientesSeleccionados(arrayClientes || []);

      const keys = (arrayClientes || []).map((location: any) => location.id);
      setSelectedRowKeys(keys);
    }
  }, [detalleDeRuta]);

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

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth]);

  return (
    <>
      <Form
        form={form}
        name="login-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          nombreDeRuta: "",
          diasDeEntrega: [],
          frecuenciaDeEntrega: "",
          horaDeSalida: "",
          tipoDeRuta: "",
          chofer: "",
          estatus: true,
          // propiedades dinamicas
          clientes: [],
          geofence: [],
        }}
        onFinish={async (values) => {
          try {
            if (tipoDeRuta == "Geofence" && geofenceCoordinates.length == 0) {
              return Swal.fire({
                title: "ERROR",
                text: "Seleccione los puntos en el mapa",
                icon: "error",
              });
            }

            if (tipoDeRuta == "Geofence" && selectedRowKeys.length == 0) {
              return Swal.fire({
                title: "ERROR",
                text: "Seleccione al menos un cliente dentro de la zona",
                icon: "error",
              });
            }

            dispatch(setLoading(true));

            // Buscar chofer
            const findChoferAsignado = COLABORADORES_CHOFER.find(
              (colaborador: any) => colaborador?.id == values.chofer
            );
            const choferAsignado = findChoferAsignado
              ? `${findChoferAsignado?.nombres} ${findChoferAsignado?.apellidos}`
              : "Desconocido";

            const [fechaRegistro] = new Date().toISOString().split("T");
            const newRutaId = await FireStoreFinanzas.registrarRuta(
              auth?.empresa?.id,
              {
                ...values,
                usuarioRegistro: auth?.uid || auth?.empresa?.id,
                geofence: tipoDeRuta == "Geofence" ? geofenceCoordinates : [],
                clientes: listaDeClientes.filter((cliente: any) =>
                  (values.clientes || []).includes(cliente.id)
                ),
                nombreChofer: choferAsignado,
                horaDeSalida: values.horaDeSalida.format("HH:mm:ss"),
                fechaRegistroDoc: fechaRegistro,
                clientesSeleccionadosEnGeofence: listaDeClientes.filter(
                  (cliente: any) => (selectedRowKeys || []).includes(cliente.id)
                ),
              }
            );

            dispatch(setLoading(false));
            form.resetFields();
            dispatch(setOpenDrawerRutas(false));
            dispatch(setNewRutaId(newRutaId));
            dispatch(setRefresh(Math.random()));
            dispatch(setRefreshSubCollection(true));

            // Limpiamos el estado del geofence
            setGeofenceCoordinates([]);

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Ruta ${
                values.id ? "actualizada" : "registrada"
              } con éxito!`,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error: any) {
            dispatch(setLoading(false));
            console.log("error", error);
            Swal.fire({
              title: "ERROR",
              text: error?.toString(),
              icon: "error",
            });
          }
        }}
      >
        <Row gutter={12} style={{ marginTop: "1rem" }}>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            {/* start input hidden */}
            <Form.Item
              style={{ display: "none" }}
              name="id"
              label="Id"
              rules={[{ required: false, message: "Ingrese Id" }]}
            >
              <Input placeholder="Ingrese Id" style={style} />
            </Form.Item>
            {/* end input hidden */}

            <Form.Item
              name="nombreDeRuta"
              label="Nombre de la ruta"
              rules={[{ required: true, message: "Ingrese Nombre de la ruta" }]}
            >
              <Input placeholder="Ingrese Nombre de la ruta" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="diasDeEntrega"
              label="Días de entrega"
              rules={[
                { required: true, message: "Seleccione Días de entrega" },
              ]}
            >
              <Select
                mode="multiple"
                maxTagCount="responsive"
                // listHeight={200}
                style={{ ...style, minWidth: "300px", height: "32px" }}
                placeholder="Seleccione Días de entrega"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={DIAS_DE_ENTREGA}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="frecuenciaDeEntrega"
              label="Frecuencia de Entrega"
              rules={[
                { required: true, message: "Seleccione Frecuencia de Entrega" },
              ]}
            >
              <Select
                // mode="multiple"
                maxTagCount="responsive"
                // listHeight={200}
                style={{ ...style, minWidth: "300px", height: "32px" }}
                placeholder="Seleccione Frecuencia de Entrega"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={FRECUENCIA_DE_ENTREGA}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="horaDeSalida"
              label="Hora de Salida"
              rules={[{ required: true, message: "Seleccione Hora de Salida" }]}
            >
              <TimePicker
                onChange={(date, dateString: any) => {}}
                style={{ width: "100%", minWidth: "120px" }}
                placeholder="Seleccione Hora de Salida"
                format="HH:mm:ss"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="tipoDeRuta"
              label="Tipo de Ruta"
              rules={[{ required: true, message: "Seleccione Tipo de Ruta" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Tipo de Ruta"
                optionFilterProp="label"
                onChange={(tipoDeRutaValue) => {
                  setTipoDeRuta(tipoDeRutaValue);
                }}
                onSearch={() => {}}
                options={TIPO_DE_RUTA}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="clientes"
              label="Clientes"
              style={{ display: tipoDeRuta == "Clientes" ? "block" : "none" }}
              rules={[
                {
                  required: tipoDeRuta == "Clientes" ? true : false,
                  message: "Seleccione Clientes",
                },
              ]}
            >
              <Select
                mode="multiple"
                maxTagCount="responsive"
                // listHeight={200}
                style={{ ...style, minWidth: "300px", height: "32px" }}
                placeholder="Seleccione Clientes"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={CLIENTES}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      block
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        // Abrir el formulario de registrar articulos
                        formClientes.resetFields();

                        dispatch(setPerfilClientes(null));
                        dispatch(setOpenDrawerVentas(true));
                      }}
                    >
                      Nuevo cliente
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            {tipoDeRuta == "Geofence" && (
              <React.Fragment key={geofenceCoordinates.length}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      zIndex: 999,
                    }}
                  >
                    <Button
                      style={{ float: "right" }}
                      type="primary"
                      onClick={() => {
                        setSelectedRowKeys([]);
                        setGeofenceCoordinates([]);
                        setClientesSeleccionados([]);
                      }}
                    >
                      Limpiar Geofence
                    </Button>
                  </div>
                  <GeofenceMap
                    onGeofenceComplete={handleGeofenceComplete}
                    initialCoordinates={geofenceCoordinates}
                    locations={clientesMap}
                    onLocationsInPolygon={handleLocationsInPolygon}
                  />
                </div>

                {Boolean(clientesSeleccionados.length) && (
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong>
                        Lista de clientes ({clientesSeleccionados.length})
                      </strong>
                    </div>
                    <Table
                      bordered
                      pagination={false}
                      dataSource={clientesSeleccionados}
                      rowKey="id"
                      columns={[
                        {
                          title: "Cliente",
                          dataIndex: "nombreCliente",
                          key: "nombreCliente",
                        },
                        {
                          title: "Contacto",
                          dataIndex: "nombreContacto",
                          key: "nombreContacto",
                        },
                        {
                          title: "Dirección",
                          dataIndex: "place",
                          key: "place",
                        },
                        {
                          title: "Tipo",
                          dataIndex: "tipoDireccion",
                          key: "tipoDireccion",
                        },
                      ]}
                      rowSelection={{
                        type: "checkbox",
                        selectedRowKeys,
                        onChange: (keys) => {
                          console.log("Seleccionando:", keys);
                          setSelectedRowKeys(keys);
                        },
                      }}
                      scroll={{
                        x: 768,
                      }}
                      size="small"
                    />
                  </div>
                )}
              </React.Fragment>
            )}
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="chofer"
              label="Chofer"
              rules={[{ required: true, message: "Seleccione Chofer" }]}
            >
              <Select
                options={COLABORADORES_CHOFER}
                placeholder="Seleccione Chofer"
                style={{ flex: 1 }}
                showSearch
                optionFilterProp="label"
                onChange={() => {}}
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
                        formColaboradores.resetFields();
                        formColaboradores.setFieldValue("puesto", "Chofer");

                        dispatch(setPerfilUsuario(null));
                        dispatch(setOpenDrawer(true));

                        const listaDeSucursales =
                          await FireStoreConfiguracion.listarSucursales({
                            idEmpresa: auth?.empresa?.id || "",
                          });
                        dispatch(setListaDeSucursales(listaDeSucursales));
                      }}
                    >
                      Nuevo chofer
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={12} />
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              valuePropName="checked"
              name="estatus"
              rules={[{ required: false, message: "" }]}
            >
              <Checkbox>Estatus Inicial</Checkbox>
            </Form.Item>
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
                Limpiar
              </Button>
              <Button
                loading={loading}
                icon={<SaveOutlined />}
                type="primary"
                block
                htmlType="submit"
              >
                Guardar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Drawer
        title={perfilUsuario?.id ? "Editar colaborador" : "Nuevo colaborador"}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilUsuario?.id ? "orange" : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        {openDrawer && <FormColaboradores form={formColaboradores} />}
      </Drawer>

      <Drawer
        title={perfilCliente?.id ? "Editar cliente" : "Nuevo cliente"}
        width={768}
        onClose={() => dispatch(setOpenDrawerVentas(false))}
        open={openDrawerVentas}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilCliente?.id ? "orange" : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        {openDrawerVentas && <FormClientes form={formClientes} />}
      </Drawer>
    </>
  );
};

export default FormRutas;
