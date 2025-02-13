"use client";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Table,
  TimePicker,
  Tooltip,
} from "antd";
import * as React from "react";
import Swal from "sweetalert2";
import {
  UndoOutlined,
  SaveOutlined,
  SmileOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import {
  setLoading,
  setNewSucursalId,
  setOpenDrawer as setOpenDrawerConfiguracion,
  setRefresh,
} from "@/features/configuracionSlice";
import {
  setListaDeUsuarios,
  setOpenDrawerSucursal,
} from "@/features/recursosHumanosSlice";
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import GoogleMaps from "@/components/GoogleMaps";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { onAuthStateChanged } from "firebase/auth";
import {
  setOpenDrawer as setOpenDrawerRecursosHumanos,
  setPerfilUsuario,
} from "@/features/recursosHumanosSlice";
import { useState } from "react";
import FormColaboradores from "@/components/recursos-humanos/colaboradores/FormColaboradores";

dayjs.extend(customParseFormat);

const style: React.CSSProperties = { width: "100%" };

const TIPO_DE_SUCURSAL = [
  { label: "Tienda", value: "Tienda" },
  { label: "Oficina", value: "Oficina" },
  { label: "Bodega", value: "Bodega" },
  { label: "Centro de Distribución", value: "Centro de Distribución" },
];

const OPTIONS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const FormSucursales = ({ form }: any) => {
  const dispatch = useDispatch();
  const [formColaboradores]: any = Form.useForm();
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [ENCARGADOS, setENCARGADOS] = useState<any[]>([]);
  const [openAddEncargado, setOpenAddEncargado] = useState(false);

  const { listaDeUsuarios, perfilUsuario, openDrawer } = useSelector(
    (state: any) => state.recursosHumanos
  );

  const {
    loading,
    detalleDeSucursal,
    // google maps
    coordinates,
    address,
    auth,
  } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    FireStoreRecursosHumanos.listarUsuarios({
      idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
    }).then((listaDeUsuarios) => {
      dispatch(setListaDeUsuarios(listaDeUsuarios));
    });
  }, []);

  React.useEffect(() => {
    const horarios = form.getFieldValue("horarios") || [];
    setIsTableVisible(horarios.length > 0);
  }, [detalleDeSucursal, form]);

  //Efecto para actualizar el Select de Encargados
  React.useEffect(() => {
    const updateEnc = async () => {
      const newList = await FireStoreRecursosHumanos.listarUsuarios({
        idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
      });

      const encargados = newList.map((colaborador: any) => {
        return {
          label: `${colaborador?.nombres} ${colaborador?.apellidos}`,
          value: colaborador?.id,
        };
      });

      if (openAddEncargado) {
        if (encargados.length > ENCARGADOS.length) {
          const nuevoEncargado = encargados[0]?.value;
          if (nuevoEncargado) {
            form.setFieldsValue({ encargado: nuevoEncargado });
          }
        }
      }

      setENCARGADOS(encargados);
    };
    updateEnc();
  }, [listaDeUsuarios]);

  // Función para obtener todos los días seleccionados en todos los horarios
  const getSelectedDays = () => {
    const values = form.getFieldsValue();
    const allSelectedDays = new Set<string>();
    values.horarios?.forEach((horario: any) => {
      horario?.dias?.forEach((dia: string) => {
        allSelectedDays.add(dia);
      });
    });
    return Array.from(allSelectedDays);
  };

  // Efecto para actualizar los días seleccionados cuando cambian los horarios
  React.useEffect(() => {
    const values = form.getFieldsValue();
    form.setFieldsValue(values);
  }, [form]);

  return (
    <>
      <Form
        form={form}
        name="login-form"
        layout="vertical"
        style={{ width: "100%" }}
        /* requiredMark={customizeRequiredMark} */
        initialValues={{
          id: "",
          nombre: "",
          direccion: "",
          coordinates: { lat: null, lng: null },
          tipoSucursal: "",
          encargado: "",
          horarios: [],
          estadoDeOperacion: true,
        }}
        onFinish={async (values) => {
          try {
            if (!address || !coordinates?.lat || !coordinates?.lng) {
              Swal.fire({
                title: "Ingrese una dirección",
                text: "",
                icon: "warning",
              });
              return;
            }

            dispatch(setLoading(true));
            // REGISTRAMOS EL USUARIO EN FIRESTORE
            const newSucursalId =
              await FireStoreConfiguracion.registrarSucursal(
                auth?.empresa?.id,
                {
                  ...values,
                  horarios: values.horarios.map((horario: any) => ({
                    ...horario,
                    inicio: horario.inicio.format("HH:mm:ss"),
                    fin: horario.fin.format("HH:mm:ss"),
                  })),
                  direccion: address,
                  coordinates,
                }
              );
            dispatch(setLoading(false));

            form.resetFields();
            dispatch(setOpenDrawerConfiguracion(false));
            dispatch(setOpenDrawerSucursal(false));
            dispatch(setNewSucursalId(newSucursalId));
            dispatch(setRefresh(Math.random()));

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Bodega ${
                detalleDeSucursal?.id ? "actualizada" : "registrada"
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
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
              name="nombre"
              label="Nombre de bodega"
              rules={[{ required: true, message: "Ingrese Nombre de bodega" }]}
            >
              <Input placeholder="Ingrese Nombre de bodega" style={style} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <GoogleMaps title="Ingrese la dirección" />
          </Col>
          <Divider />
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="tipoSucursal"
              label="Tipo de bodega"
              rules={[{ required: true, message: "Seleccione Tipo de bodega" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Tipo de bodega"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={TIPO_DE_SUCURSAL}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="encargado"
              label="Encargado"
              rules={[{ required: false, message: "Seleccione Encargado" }]}
            >
              <Select
                showSearch
                style={style}
                placeholder="Seleccione Encargado"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={ENCARGADOS}
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

                        dispatch(setPerfilUsuario(null));
                        dispatch(setOpenDrawerRecursosHumanos(true));
                        setOpenAddEncargado(true);
                      }}
                    >
                      Nuevo Encargado
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={0} style={{ width: "100%" }}>
          <Divider>Horarios de atención</Divider>
          <Form.List name="horarios">
            {(fields, { add, remove }) => (
              <>
                {isTableVisible && (
                  <Table
                    dataSource={fields.map(({ key, name, ...restField }) => ({
                      key,
                      name,
                      restField,
                    }))}
                    columns={[
                      {
                        title: "Hora inicio",
                        dataIndex: "key",
                        key: "inicio",
                        render: (_, { name, restField }) => (
                          <Form.Item
                            {...restField}
                            name={[name, "inicio"]}
                            rules={[
                              {
                                required: true,
                                message: "Seleccione hora inicio",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <TimePicker
                              style={{ width: "100%" }}
                              placeholder="Inicio"
                              format="HH:mm:ss"
                            />
                          </Form.Item>
                        ),
                      },
                      {
                        title: "Hora fin",
                        dataIndex: "key",
                        key: "fin",
                        render: (_, { name, restField }) => (
                          <Form.Item
                            {...restField}
                            name={[name, "fin"]}
                            rules={[
                              {
                                required: true,
                                message: "Seleccione hora fin",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <TimePicker
                              style={{ width: "100%" }}
                              placeholder="Fin"
                              format="HH:mm:ss"
                            />
                          </Form.Item>
                        ),
                      },
                      {
                        title: "Días de atención",
                        dataIndex: "key",
                        key: "dias",
                        render: (_, { name, restField }) => (
                          <Form.Item
                            {...restField}
                            name={[name, "dias"]}
                            rules={[
                              {
                                required: true,
                                message: "Seleccione días de atención",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              mode="multiple"
                              options={OPTIONS.filter((dia) => {
                                const currentValues =
                                  form.getFieldValue([
                                    "horarios",
                                    name,
                                    "dias",
                                  ]) || [];
                                const otherSelectedDays =
                                  getSelectedDays().filter(
                                    (d) => !currentValues.includes(d)
                                  );
                                return !otherSelectedDays.includes(dia);
                              }).map((dia) => ({ label: dia, value: dia }))}
                              placeholder="Seleccione días"
                              style={{ width: "100%", minWidth: "300px" }}
                            />
                          </Form.Item>
                        ),
                      },
                      {
                        title: "",
                        dataIndex: "key",
                        key: "action",
                        render: (_, { name }) => (
                          <Tooltip title="Eliminar horario">
                            <Button
                              type="dashed"
                              shape="circle"
                              icon={<MinusCircleOutlined />}
                              danger
                              onClick={() => {
                                remove(name);
                                if (fields.length === 1)
                                  setIsTableVisible(false);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "auto",
                              }}
                            />
                          </Tooltip>
                        ),
                      },
                    ]}
                    pagination={false}
                    // rowClassName={() => "editable-row"}
                    style={{
                      width: "100%",
                    }}
                    // locale={{ emptyText: null }}
                  />
                )}
                <Button
                  type="dashed"
                  onClick={() => {
                    if (!isTableVisible) setIsTableVisible(true);
                    add();
                  }}
                  block
                  style={{ marginTop: "16px" }}
                >
                  Agregar horario
                </Button>
              </>
            )}
          </Form.List>
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
        onClose={() => {
          dispatch(setOpenDrawerRecursosHumanos(false));
        }}
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
    </>
  );
};

export default FormSucursales;
