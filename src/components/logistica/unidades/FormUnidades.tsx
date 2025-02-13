"use client";
import React, { useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Upload,
  DatePicker,
  InputNumber,
  Drawer,
} from "antd";
import {
  UndoOutlined,
  SaveOutlined,
  UploadOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setOpenDrawerUnidad,
  setRefresh,
  setRefreshSubCollection,
  setSubCollectionEmpresa,
  setListaDeUnidades,
  setOpenDrawerRutas,
  setDetalleDeUnidad,
} from "@/features/finanzasSlice";
import { setOpenDrawer as setOpenDrawerColaboradores } from "@/features/recursosHumanosSlice";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { generateRandomString } from "@/helpers/functions";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import FormRutas from "../rutas/FormRutas";
import FormColaboradores from "@/components/recursos-humanos/colaboradores/FormColaboradores";
import { setDetalleUnidadVehicular } from "@/features/inventarioSlice";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
dayjs.extend(customParseFormat);

const style: React.CSSProperties = { width: "100%" };

const uploadFile = async (file: any, unitId: string, folder: string) => {
  const storage = getStorage();
  const storageRef = ref(
    storage,
    `unidadesVehiculosFiles/${unitId}/${folder}/${file?.name}`
  );
  try {
    const { metadata } = await uploadBytes(storageRef, file, {
      contentType: file?.type,
    });
    const { bucket, contentType, name, fullPath } = metadata;
    const fileUrl = await getDownloadURL(storageRef);
    return { url: fileUrl, bucket, contentType, name, fullPath };
  } catch (error) {
    throw error;
  }
};

const swalAlertInput = async (title: string) => {
  return await Swal.fire({
    icon: "info",
    input: "text",
    title: title,
    // text: title,
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: "Agregar",
    denyButtonText: "Cancelar",
    confirmButtonColor: "#1677ff",
    cancelButtonColor: "#d33",
    inputValidator: (value) => {
      if (!Boolean(value?.trim()?.length)) {
        return `Debe ${title?.toLowerCase()}`;
      }
    },
  });
};

export const UNIT_STATUS = [
  { label: "Disponible", value: "Disponible" },
  { label: "En Ruta", value: "En Ruta" },
  { label: "En Mantenimiento", value: "En Mantenimiento" },
  { label: "Fuera de Servicio", value: "Fuera de Servicio" },
];

const FormUnidades = ({ form }: any) => {
  const [formRutas] = Form.useForm();
  const [formChofer] = Form.useForm();

  const dispatch = useDispatch();

  const {
    loading,
    subCollectionEmpresa = {},
    detalleDeUnidad,
    refreshSubCollection,
    openDrawerRutas,
    newRutaId,
  } = useSelector((state: any) => state.finanzas);

  const { auth, listaDeSucursales } = useSelector(
    (state: any) => state.configuracion
  );
  const { openDrawer: openDrawerColaboradores, newUsuarioId } = useSelector(
    (state: any) => state.recursosHumanos
  );

  //Listar subCollection
  React.useEffect(() => {
    if (auth.empresa) {
      Promise.all([
        FireStoreFinanzas.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "tipoVehiculos"
        ),
        FireStoreFinanzas.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "rutas"
        ),
        FireStoreRecursosHumanos.listarUsuarios({
          idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
        }),
      ]).then(([tiposVehiculos = [], rutas = [], usuarios = []]) => {
        dispatch(
          setSubCollectionEmpresa({
            tiposVehiculos: [
              ...tiposVehiculos.map(({ nombre, id }: any) => ({
                label: nombre,
                value: id,
              })),
            ],
            rutas,
            usuarios,
          })
        );
      });
    }
  }, [auth, refreshSubCollection]);

  useEffect(() => {
    if (newRutaId) {
      //Setear la ruta en el form y refrescar las rutas y demas informacion
      dispatch(setRefreshSubCollection(true));
      form.setFieldsValue({
        rutaAsignada: newRutaId,
      });
    }
  }, [newRutaId]);

  useEffect(() => {
    if (newUsuarioId) {
      //Setear la ruta en el form y refrescar los usuarios y demas informacion
      dispatch(setRefreshSubCollection(true));
      form.setFieldsValue({
        choferAsignado: newUsuarioId,
      });
    }
  }, [newUsuarioId]);

  const { listaDeProveedores } = useSelector((state: any) => state.ventas);
  const [maintenanceFile, setMaintenanceFile] = React.useState<any>(null);
  const [insuranceFile, setInsuranceFile] = React.useState<any>(null);
  const [circulationCardFile, setCirculationCardFile] =
    React.useState<any>(null);

  // Cargar datos de la unidad cuando estamos en modo edición
  React.useEffect(() => {
    if (detalleDeUnidad) {
      const { fechaMantenimiento, ...others } = detalleDeUnidad;

      form.setFieldsValue({
        ...others,
        fechaMantenimiento: fechaMantenimiento
          ? dayjs(fechaMantenimiento, "YYYY-MM-DD")
          : null,
      });
    }
  }, [detalleDeUnidad, form]);

  React.useEffect(() => {
    const cargarTiposVehiculos = async () => {
      if (auth?.empresa?.id) {
        try {
          const tiposVehiculos =
            await FireStoreFinanzas.listarSubCollectionEmpresa(
              auth.empresa.id,
              "tipoVehiculos"
            );
          console.log("Tipos de vehículos cargados:", tiposVehiculos);
          dispatch(
            setSubCollectionEmpresa({
              tipoVehiculos: tiposVehiculos,
            })
          );
        } catch (error) {
          console.error("Error al cargar tipos de vehículos:", error);
        }
      }
    };
    cargarTiposVehiculos();
  }, [auth?.empresa?.id, dispatch]);

  const getRutaLabel = (
    ruta: any,
    listaDeProveedores: any[],
    listaDeSucursales: any[]
  ) => {
    if (ruta.tipoDeRuta === "Proveedor") {
      const proveedor = listaDeProveedores?.find(
        (p) => p.id === ruta.proveedor
      );
      return `${ruta.tipoDeRuta} - ${ruta.nombreDeRuta} - ${
        proveedor?.nombreProveedor || ""
      }`;
    } else if (ruta.tipoDeRuta === "Automática") {
      const sucursal = listaDeSucursales?.find((s) => s.id === ruta.sucursal);
      return `${ruta.tipoDeRuta} - ${ruta.nombreDeRuta} - ${
        sucursal?.nombre || ""
      }`;
    }
    return `${ruta.tipoDeRuta} - ${ruta.nombreDeRuta}`;
  };

  // Preparar lista de choferes
  const CHOFERES = (subCollectionEmpresa?.usuarios || [])
    .filter((colaborador: any) => colaborador.puesto === "Chofer")
    .map((colaborador: any) => {
      return {
        ...colaborador,
        label: `${colaborador?.nombres} ${colaborador?.apellidos}`,
        value: colaborador?.id,
      };
    });

  const RUTAS = subCollectionEmpresa?.rutas?.map((ruta: any) => ({
    ...ruta,
    label: getRutaLabel(ruta, listaDeProveedores, listaDeSucursales),
    value: ruta.id,
  }));

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (values: any) => {
    try {
      dispatch(setLoading(true));

      // Generate unit ID if not exists (only for new units)
      if (!values.id) {
        values.idUnidad = generateRandomString();
      }

      // Upload files if they exist
      if (maintenanceFile) {
        const fileData = await uploadFile(
          maintenanceFile,
          values.id || values.idUnidad,
          "maintenance"
        );
        values.maintenanceFile = fileData;
      }
      if (insuranceFile) {
        const fileData = await uploadFile(
          insuranceFile,
          values.id || values.idUnidad,
          "insurance"
        );
        values.insuranceFile = fileData;
      }
      if (circulationCardFile) {
        const fileData = await uploadFile(
          circulationCardFile,
          values.id || values.idUnidad,
          "circulation"
        );
        values.circulationCardFile = fileData;
      }

      const { fechaMantenimiento, choferAsignado, rutaAsignada, ...others } =
        values;

      // Encontrar el chofer seleccionado
      const choferSeleccionado = CHOFERES.find(
        (chofer: any) => chofer.value === choferAsignado
      );
      const nombreChofer = choferSeleccionado
        ? `${choferSeleccionado.nombres} ${choferSeleccionado.apellidos}`
        : "";

      const unidadData = {
        ...others,
        fechaMantenimiento: fechaMantenimiento
          ? fechaMantenimiento?.format("YYYY-MM-DD")
          : null,
        rutaAsignada: rutaAsignada || "",
        choferAsignado: choferAsignado || "",
        nombreChofer, // Guardamos el nombre completo del chofer
      };

      if (values.id) {
        // Editar unidad existente
        await FireStoreFinanzas.actualizarUnidad(
          auth?.empresa?.id,
          values.id,
          unidadData
        );
      } else {
        // Registrar nueva unidad
        await FireStoreFinanzas.registrarUnidad(auth?.empresa?.id, unidadData);
      }

      // Obtener la lista actualizada de unidades y filtrar las disponibles
      const unidades = await FireStoreFinanzas.listarUnidadesVehiculares({
        idEmpresa: auth.empresa.id,
      });
      // Filtrar solo las unidades que no tienen chofer asignado
      const unidadesDisponibles = unidades.filter(
        (unidad: any) =>
          !unidad.choferAsignado || unidad.choferAsignado === "false"
      );
      dispatch(setListaDeUnidades(unidadesDisponibles));

      dispatch(setLoading(false));
      form.resetFields();
      dispatch(setOpenDrawerUnidad(false));
      dispatch(setRefresh(Math.random()));

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Unidad ${values.id ? "actualizada" : "registrada"} con éxito!`,
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.toString(),
        icon: "error",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Form
        form={form}
        name="unit-form"
        layout="vertical"
        style={{ width: "100%" }}
        onFinish={handleSubmit}
        initialValues={{
          id: "",
          idUnidad: "",
          placas: "",
          tipoVehiculo: "",
          marca: "",
          modelo: "",
          anioFabricacion: "",
          choferAsignado: "",
          rutaAsignada: "",
          status: "Disponible",
          fechaMantenimiento: null,
          costoMantenimiento: 0.0,
          descripcionMantenimiento: "",
        }}
      >
        {/* Hidden ID field */}
        <Form.Item
          style={{ display: "none" }}
          name="id"
          label="Id"
          rules={[{ required: false, message: "Ingrese Id" }]}
        >
          <Input placeholder="Ingrese ID" style={style} />
        </Form.Item>

        {/* Basic Information */}
        <Divider orientation="left">Información Básica</Divider>
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="idUnidad"
              label="ID Unidad"
              help="Se generará automáticamente al guardar"
            >
              <Input disabled style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="placas"
              label="Placas"
              rules={[
                { required: true, message: "Las placas son obligatorias" },
                { max: 10, message: "Máximo 10 caracteres" },
              ]}
            >
              <Input style={style} placeholder="Ingrese las placas" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="tipoVehiculo"
              label="Tipo de Vehículo"
              rules={[
                {
                  required: true,
                  message: "Por favor seleccione el tipo de vehículo",
                },
              ]}
            >
              <Select
                style={style}
                options={subCollectionEmpresa?.tipoVehiculos.map(
                  (tipo: any) => ({
                    label: tipo.nombre,
                    value: tipo.id,
                  })
                )}
                placeholder="Seleccione el tipo"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      block
                      onClick={async () => {
                        try {
                          const { isConfirmed, value } = await swalAlertInput(
                            "Agregar tipo de vehículo"
                          );
                          if (isConfirmed && value) {
                            const newId = uuidv4();
                            await FireStoreFinanzas.agregarDocumentoEmpresasCollection(
                              auth?.empresa?.id,
                              newId,
                              { nombre: value },
                              "tipoVehiculos"
                            );

                            // Actualizar la lista de tipos de vehículos
                            const tiposVehiculos =
                              await FireStoreFinanzas.listarSubCollectionEmpresa(
                                auth?.empresa?.id,
                                "tipoVehiculos"
                              );
                            const formattedVehiculos = tiposVehiculos.map(
                              (tipo: any) => ({
                                label: tipo.nombre,
                                value: tipo.id,
                              })
                            );
                            dispatch(
                              setSubCollectionEmpresa({
                                tipoVehiculos: formattedVehiculos,
                              })
                            );

                            form.setFieldsValue({ tipoVehiculo: newId });

                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: "Tipo de vehículo agregado con éxito",
                              showConfirmButton: false,
                              timer: 1500,
                            });
                          }
                        } catch (error) {
                          console.error(
                            "Error al agregar tipo de vehículo:",
                            error
                          );
                          Swal.fire({
                            title: "Error",
                            text: "No se pudo agregar el tipo de vehículo",
                            icon: "error",
                          });
                        }
                      }}
                    >
                      Agregar nuevo tipo
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="marca"
              label="Marca"
              rules={[{ required: true, message: "La marca es obligatoria" }]}
            >
              <Input style={style} placeholder="Ingrese la marca" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="modelo"
              label="Modelo"
              rules={[{ required: true, message: "El modelo es obligatorio" }]}
            >
              <Input style={style} placeholder="Ingrese el modelo" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="anioFabricacion"
              label="Año de Fabricación"
              rules={[
                { required: true, message: "El año es obligatorio" },
                {
                  validator: (_, value) =>
                    value && value > currentYear
                      ? Promise.reject("El año no puede ser futuro")
                      : Promise.resolve(),
                },
              ]}
            >
              <InputNumber
                style={style}
                min={1900}
                max={currentYear}
                placeholder="YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Assignments */}
        <Divider orientation="left">Asignaciones</Divider>
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item name="choferAsignado" label="Chofer Asignado">
              <Select
                style={style}
                options={CHOFERES}
                allowClear
                placeholder="Ingresa el chofer a asignar"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      block
                      onClick={async (_) => {
                        const { isConfirmed } = await Swal.fire({
                          title:
                            "¿Desea continuar con el registro del nuevo colaborador (chofer)?",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Sí, continuar",
                          cancelButtonText: "No, cancelar",
                        });

                        if (isConfirmed) {
                          dispatch(setOpenDrawerColaboradores(true));
                        }
                      }}
                    >
                      Agregar nuevo chofer
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="rutaAsignada" label="Ruta Asignada">
              <Select
                style={style}
                options={RUTAS}
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      block
                      onClick={async (ruta) => {
                        const { isConfirmed } = await Swal.fire({
                          title: "¿Desea continuar con el registro de la ruta?",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Sí, continuar",
                          cancelButtonText: "No, cancelar",
                        });

                        if (isConfirmed) {
                          dispatch(setOpenDrawerRutas(true));
                        }
                      }}
                    >
                      Agregar nueva ruta
                    </Button>
                  </>
                )}
                placeholder="Seleccione una ruta"
                onChange={(value: any) => console.log("VALOR ES: ", value)}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="status"
              label="Estatus de la Unidad"
              rules={[{ required: true, message: "El estatus es obligatorio" }]}
            >
              <Select
                style={style}
                options={UNIT_STATUS}
                placeholder="Seleccione el estatus"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Maintenance Section */}
        <Divider orientation="left">Mantenimiento</Divider>
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item name="fechaMantenimiento" label="Fecha de Mantenimiento">
              <DatePicker
                style={style}
                placeholder="Seleccione la fecha"
                allowClear={true}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="costoMantenimiento"
              label="Costo del Mantenimiento"
            >
              <InputNumber
                style={style}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="descripcionMantenimiento"
              label="Descripción del Mantenimiento"
            >
              <Input.TextArea
                rows={4}
                placeholder="Describa el mantenimiento realizado"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Comprobante de Mantenimiento">
              <Upload
                accept="application/pdf,image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    Swal.fire({
                      title: "Error",
                      text: "El archivo debe ser menor a 5MB",
                      icon: "error",
                      confirmButtonText: "Ok",
                    });
                    return false;
                  }
                  setMaintenanceFile(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Subir comprobante</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Documentation Section */}
        <Divider orientation="left">Documentación</Divider>
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Seguro del Vehículo">
              <Upload
                accept="application/pdf,image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    Swal.fire({
                      title: "Error",
                      text: "El archivo debe ser menor a 5MB",
                      icon: "error",
                      confirmButtonText: "Ok",
                    });
                    return false;
                  }
                  setInsuranceFile(file);
                  return false;
                }}
              >
                <Button icon={<FilePdfOutlined />}>Subir póliza</Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Tarjeta de Circulación">
              <Upload
                accept="application/pdf,image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    Swal.fire({
                      title: "Error",
                      text: "El archivo debe ser menor a 5MB",
                      icon: "error",
                      confirmButtonText: "Ok",
                    });
                    return false;
                  }
                  setCirculationCardFile(file);
                  return false;
                }}
              >
                <Button icon={<FilePdfOutlined />}>Subir tarjeta</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Form Actions */}
        <Row justify="end" gutter={[8, 8]} style={{ marginTop: "24px" }}>
          <Col>
            <Button
              onClick={() => {
                form.resetFields();
                dispatch(setOpenDrawerUnidad(false));
              }}
              icon={<UndoOutlined />}
            >
              Cancelar
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Guardar
            </Button>
          </Col>
        </Row>
      </Form>
      <Drawer
        title="Nueva ruta"
        width={768}
        onClose={() => dispatch(setOpenDrawerRutas(false))}
        open={openDrawerRutas}
      >
        <FormRutas form={formRutas} />
      </Drawer>
      <Drawer
        title="Nuevo chofer"
        width={768}
        onClose={() => dispatch(setOpenDrawerColaboradores(false))}
        open={openDrawerColaboradores}
      >
        <FormColaboradores form={formChofer} />
      </Drawer>
    </>
  );
};

export default FormUnidades;
