"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Upload,
  Tooltip,
  Drawer,
} from "antd";
import {
  FileImageOutlined,
  UndoOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import {
  setLoading,
  setOpenDrawer,
  setRefresh,
  setOpenDrawerSucursal,
  setNewUsuarioId,
  setListaDeUsuarios,
} from "@/features/recursosHumanosSlice";
import { useDispatch, useSelector } from "react-redux";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import FormSucursales from "@/components/configuracion/sucursales/FormSucursales";
import {
  setDetalleDeSucursal,
  setNewSucursalId,
} from "@/features/configuracionSlice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  setListaDeUnidades,
  setOpenDrawerUnidad,
  setDetalleDeUnidad,
} from "@/features/finanzasSlice";
import FireStoreLogistica from "@/firebase/FireStoreLogistica";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import { Timestamp } from "firebase/firestore";
import FormUnidades from "@/components/logistica/unidades/FormUnidades";

dayjs.extend(customParseFormat);

const style: React.CSSProperties = { width: "100%" };

export const GENEROS = [
  { label: "Masculino", value: "Masculino" },
  { label: "Femenino", value: "Femenino" },
  { label: "No Binario", value: "No Binario" },
  { label: "Prefiero no decirlo", value: "Prefiero no decirlo" },
];

export const ESTADOS_CIVIL = [
  { label: "Soltero(a)", value: "Soltero(a)" },
  { label: "Casado(a)", value: "Casado(a)" },
  { label: "Viudo(a)", value: "Viudo(a)" },
  { label: "Divorciado(a)", value: "Divorciado(a)" },
  { label: "Separado(a)", value: "Separado(a)" },
  { label: "Unión libre", value: "Unión libre" },
];

export const ROLES = [
  { label: "Superadmin", value: "Superadmin" },
  { label: "Admin", value: "Admin" },
  { label: "Admin de RH", value: "Admin de RH" },
  { label: "Consultor RH", value: "Consultor RH" },
  { label: "Admin de inventarios", value: "Admin de inventarios" },
  { label: "Consultor de inventarios", value: "Consultor de inventarios" },
  { label: "Admin de finanzas", value: "Admin de finanzas" },
  { label: "Consultor de finanzas", value: "Consultor de finanzas" },
  { label: "Gerente de Bodega", value: "Gerente de Bodega" },
  { label: "Consultor de Bodega", value: "Consultor de Bodega" },
  { label: "Gerente de Logística", value: "Gerente de Logística" },
  { label: "Consultor de Logística", value: "Consultor de Logística" },
  { label: "Chofer", value: "Chofer" },
];

const TIPO_DE_CONTRATO = [
  { label: "Indefinido", value: "Indefinido" },
  { label: "Temporal", value: "Temporal" },
  { label: "Por proyecto", value: "Por proyecto" },
];

const TIPO_DE_PAGO = [
  { label: "Semanal", value: "Semanal" },
  { label: "Quincenal", value: "Quincenal" },
  { label: "Mensual", value: "Mensual" },
];

const DEDUCCIONES = [
  {
    label: "ISR (Impuesto Sobre la Renta)",
    value: "ISR (Impuesto Sobre la Renta)",
  },
  {
    label: "IMSS (Instituto Mexicano del Seguro Social)",
    value: "IMSS (Instituto Mexicano del Seguro Social)",
  },
  { label: "Otros impuestos", value: "Otros impuestos" },
];

const BONIFICACIONES = [
  { label: "Bono por desempeño", value: "Bono por desempeño" },
  { label: "Bono por productividad", value: "Bono por productividad" },
  { label: "Bono por puntualidad", value: "Bono por puntualidad" },
  { label: "Bono por asistencia", value: "Bono por asistencia" },
  { label: "Bono anual", value: "Bono anual" },
];

const PRESTACIONES_ADICIONALES = [
  { label: "Vales de despensa", value: "Vales de despensa" },
  { label: "Seguro de vida", value: "Seguro de vida" },
  { label: "Carro de la empresa", value: "Carro de la empresa" },
  { label: "Apoyo para escuelas", value: "Apoyo para escuelas" },
  { label: "Fondo de ahorro", value: "Fondo de ahorro" },
  { label: "Gastos médicos mayores", value: "Gastos médicos mayores" },
  {
    label: "Seguro de gastos funerarios",
    value: "Seguro de gastos funerarios",
  },
];

export const ESTATUS_ACTUAL = [
  { label: "Activo", value: "Activo" },
  { label: "En entrevista", value: "En entrevista" },
  { label: "Baja", value: "Baja" },
  { label: "Suspendido", value: "Suspendido" },
  { label: "Contratado", value: "Contratado" },
  { label: "En formación", value: "En formación" },
  { label: "Pendiente", value: "Pendiente" },
];

const uploadProfileImageFB = async (file: any, userId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `profileImages/${userId}`);
  try {
    // Subir imagen
    await uploadBytes(storageRef, file);
    // Obtener URL de descarga
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  } catch (error) {
    throw error;
  }
};

const FormColaboradores = ({ form }: any) => {
  const [isDrawerUnidadesOpen, setIsDrawerUnidadesOpen] = useState(false);

  const dispatch = useDispatch();
  const [showDriverDetails, setShowDriverDetails] = React.useState(false);
  const [puesto, setPuesto] = React.useState("");
  const { listaDeUnidades = [] } = useSelector((state: any) => state.finanzas);
  const [formSucursal] = Form.useForm();
  const [formUnidades] = Form.useForm();

  const { loading, perfilUsuario, openDrawerSucursal } = useSelector(
    (state: any) => state.recursosHumanos
  );

  const { auth, listaDeSucursales, refresh, newSucursalId } = useSelector(
    (state: any) => state.configuracion
  );

  const [fileList, setFileList] = React.useState([]);

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
  };

  const handleChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList.slice(-1));
  };

  const SUCURSALES = listaDeSucursales.map((sucursal: any) => {
    return {
      ...sucursal,
      label: `${sucursal?.tipoSucursal} - ${sucursal?.nombre}`,
      value: sucursal?.id,
    };
  });

  const handleRoleChange = (value: string) => {
    setPuesto(value);
    setShowDriverDetails(value === "Chofer");
    form.setFieldsValue({ unidadAsignada: null });
  };

  const handleUnitAssignment = async (value: string) => {
    if (!value) {
      // Si se deselecciona la unidad, establecer explícitamente como null
      form.setFieldsValue({ unidadAsignada: null });
      return;
    }

    try {
      const formData = form.getFieldsValue();

      // Validar que existan los datos necesarios
      if (!formData.nombres || !formData.apellidos) {
        Swal.fire({
          title: "Error",
          text: "Por favor, completa los datos del chofer antes de asignar una unidad",
          icon: "error",
        });
        form.setFieldsValue({ unidadAsignada: null });
        return;
      }

      const selectedUnit = listaDeUnidades.find(
        (unit: any) => unit.id === value
      );

      if (selectedUnit?.choferAsignado === "true") {
        const result = await Swal.fire({
          title: "Unidad con chofer asignado",
          html: `Esta unidad ya tiene asignado al chofer: <strong>${selectedUnit.nombreChofer}</strong><br>¿Deseas reemplazarlo por este nuevo chofer?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, seleccionar",
          cancelButtonText: "No, cancelar",
        });

        if (!result.isConfirmed) {
          form.setFieldsValue({ unidadAsignada: null });
          return;
        }
      }

      // Mostrar mensaje de éxito de selección
      Swal.fire({
        title: "Unidad Seleccionada",
        text: "La unidad se asignará cuando guardes el formulario",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Recargar la lista de unidades
      const unidades = await FireStoreFinanzas.listarUnidadesVehiculares({
        idEmpresa: auth.empresa.id,
      });
      dispatch(setListaDeUnidades(unidades));
    } catch (error) {
      console.error("Error al validar unidad:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un error al validar la unidad. Por favor intenta nuevamente.",
        icon: "error",
      });
      form.setFieldsValue({ unidadAsignada: null });
    }
  };

  // Cargar unidades cuando se muestra el campo de unidad asignada
  React.useEffect(() => {
    if (showDriverDetails && auth?.empresa?.id) {
      // Cargar todas las unidades
      FireStoreFinanzas.listarUnidadesVehiculares({
        idEmpresa: auth.empresa.id,
      })
        .then((unidades: any) => {
          // Si estamos editando un chofer, incluir su unidad actual y las disponibles
          const unidadesDisponibles = unidades.filter(
            (unidad: any) =>
              !unidad.choferAsignado ||
              unidad.choferAsignado === "false" ||
              (perfilUsuario?.id && unidad.chofer === perfilUsuario.id)
          );

          // Mapear las unidades para mostrar marca, modelo y placa
          const unidadesMapeadas = unidadesDisponibles.map((unidad: any) => ({
            ...unidad,
            label: `${unidad.marca} ${unidad.modelo} - ${unidad.placas}`,
            value: unidad.id,
          }));

          dispatch(setListaDeUnidades(unidadesMapeadas));
        })
        .catch((error) => {
          console.error("Error al cargar unidades:", error);
        });
    }
  }, [showDriverDetails, auth?.empresa?.id, perfilUsuario]);

  // Cargar datos del colaborador cuando estamos en modo edición
  React.useEffect(() => {
    if (perfilUsuario) {
      // Si es chofer y tiene unidad asignada, cargar los detalles de la unidad
      if (
        perfilUsuario.puesto === "Chofer" &&
        perfilUsuario.unidadAsignada &&
        auth?.empresa?.id
      ) {
        FireStoreFinanzas.listarUnidadesVehiculares({
          idEmpresa: auth.empresa.id,
        })
          .then((unidades: any) => {
            const unidadAsignada = unidades.find(
              (unidad: any) => unidad.id === perfilUsuario.unidadAsignada
            );
            if (unidadAsignada) {
              form.setFieldsValue({
                ...perfilUsuario,
                fechaNacimiento: perfilUsuario.fechaNacimiento
                  ? dayjs(perfilUsuario.fechaNacimiento)
                  : null,
                unidadAsignada: {
                  label: `${unidadAsignada.marca} ${unidadAsignada.modelo} - ${unidadAsignada.placas}`,
                  value: unidadAsignada.id,
                },
              });
            }
          })
          .catch((error) => {
            console.error("Error al cargar la unidad asignada:", error);
          });
      } else {
        form.setFieldsValue({
          ...perfilUsuario,
          fechaNacimiento: perfilUsuario.fechaNacimiento
            ? dayjs(perfilUsuario.fechaNacimiento)
            : null,
        });
      }

      // Si es chofer, mostrar detalles inmediatamente
      if (perfilUsuario.puesto === "Chofer") {
        setShowDriverDetails(true);
      }
    }
  }, [perfilUsuario, form, auth?.empresa?.id]);

  React.useEffect(() => {
    if (newSucursalId) {
      form.setFieldsValue({ sucursal: newSucursalId });
      dispatch(setNewSucursalId(null)); // Reset the new sucursal ID after usage
    }
  }, [newSucursalId, listaDeSucursales]);

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
          // Información general
          nombres: "",
          apellidos: "",
          telefono: "",
          email: "",
          direccion: "",
          fechaNacimiento: "",
          genero: "",
          estadoCivil: "",
          // Información de empleo
          puesto: "",
          estatusActual: "",
          numeroDeSeguroSocial: "",
          curp: "",
          rfc: "",
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
        }}
        onFinish={async (values) => {
          try {
            dispatch(setLoading(true));
            // Verificar email duplicado
            const isDuplicate =
              await FireStoreRecursosHumanos.checkDuplicateEmail(
                values.email.trim(),
                perfilUsuario?.id
              );

            if (isDuplicate) {
              dispatch(setLoading(false));
              Swal.fire({
                title: "Aviso",
                text: "El correo electrónico ya está registrado para otro usuario. Por favor, use un correo diferente.",
                icon: "warning",
              });
              return;
            }

            const {
              fechaNacimiento,
              fechaRegistroIngreso,
              fechaDeContrato,
              fechaDeFinalizacionDelContrato,
              ...others
            } = values;

            let user: any = {};
            // REGISTRAMOS EL USUARIO EN FIREBASE
            if (perfilUsuario?.id) {
              // EDITAR
              user["uid"] = others?.firebaseUID;
            } else {
              // REGISTRAR
              // Aquí va tu lógica original de registro
            }

            // CARGAMOS LA IMAGEN SI HAY Y ACTUALIZAMOS EL PERFIL DEL USUARIO
            let photoURL = others?.photoURL || "";
            if (fileList.length) {
              const [file]: any = fileList;
              photoURL = await uploadProfileImageFB(
                file?.originFileObj,
                user?.uid || ""
              );
            }

            // Si es un chofer y tiene unidad asignada, preparar los datos de la unidad
            if (values.puesto === "Chofer" && values.unidadAsignada) {
              const nombreCompleto = `${values.nombres.trim()} ${values.apellidos.trim()}`;
              const userId = perfilUsuario?.id || user?.uid;

              // Datos para actualizar la unidad
              const datosUnidad = {
                nombreChofer: nombreCompleto,
                choferAsignado: "true",
                fechaAsignacionChofer: Timestamp.now(),
                chofer: userId,
                sucursal: values.sucursal,
              };

              // Si había un chofer anterior, limpiar su asignación
              const selectedUnit = listaDeUnidades.find(
                (unit: any) => unit.id === values.unidadAsignada
              );
              if (selectedUnit?.chofer && selectedUnit.chofer !== userId) {
                await FireStoreRecursosHumanos.actualizarUsuario({
                  idEmpresa: auth.empresa.id,
                  id: selectedUnit.chofer,
                  unidadAsignada: null,
                });
              }

              // Actualizar la unidad con el nuevo chofer
              await FireStoreLogistica.actualizarUnidad(
                auth.empresa.id,
                values.unidadAsignada,
                datosUnidad
              );
            }

            // REGISTRAMOS EL USUARIO EN FIRESTORE
            const newUsuarioId =
              await FireStoreRecursosHumanos.registrarUsuario({
                idEmpresa: auth?.empresa?.id,
                ...others,
                photoURL: photoURL,
                firebaseUID: user?.uid || "",
                unidadAsignada: values.unidadAsignada || null, // Asegurar que sea null si no hay valor
                fechaNacimiento: fechaNacimiento
                  ? fechaNacimiento?.format("YYYY-MM-DD")
                  : "",
                fechaRegistroIngreso: fechaRegistroIngreso
                  ? fechaRegistroIngreso?.format("YYYY-MM-DD")
                  : "",
                fechaDeContrato: fechaDeContrato
                  ? fechaDeContrato?.format("YYYY-MM-DD")
                  : "",
                fechaDeFinalizacionDelContrato: fechaDeFinalizacionDelContrato
                  ? fechaDeFinalizacionDelContrato?.format("YYYY-MM-DD")
                  : "",
              });

            // Recargar la lista de unidades si se asignó una unidad
            if (values.puesto === "Chofer" && values.unidadAsignada) {
              const unidades = await FireStoreFinanzas.listarUnidades({
                idEmpresa: auth.empresa.id,
              });
              dispatch(setListaDeUnidades(unidades));
            }

            dispatch(setLoading(false));
            setFileList([]);
            form.resetFields();
            dispatch(setOpenDrawer(false));
            dispatch(setRefresh(Math.random()));
            dispatch(setNewUsuarioId(newUsuarioId));

            // Mostrar mensaje de éxito
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Usuario ${
                perfilUsuario?.id ? "actualizado" : "registrado"
              } con éxito!${
                values.puesto === "Chofer" && values.unidadAsignada
                  ? " Unidad asignada correctamente."
                  : ""
              }`,
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
        <Row gutter={12}>
          <Divider orientation="left">Información general</Divider>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            {/* start input hidden */}
            <Form.Item
              style={{ display: "none" }}
              name="id"
              label="Id"
              rules={[{ required: false, message: "Ingrese Id" }]}
            >
              <Input placeholder="Ingrese Nombres" style={style} />
            </Form.Item>
            <Form.Item
              style={{ display: "none" }}
              name="firebaseUID"
              label="Firebase UID"
              rules={[{ required: false, message: "Ingrese Firebase UID" }]}
            >
              <Input placeholder="Ingrese Firebase UID" style={style} />
            </Form.Item>

            <Form.Item
              style={{ display: "none" }}
              name="photoURL"
              label="Firebase photoURL"
              rules={[{ required: false, message: "Ingrese Firebase UID" }]}
            >
              <Input placeholder="Ingrese Firebase photoURL" style={style} />
            </Form.Item>
            {/* end input hidden */}
            <Form.Item
              name="nombres"
              label="Nombres"
              rules={[{ required: true, message: "Ingrese Nombres" }]}
            >
              <Input placeholder="Ingrese Nombres" style={style} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="apellidos"
              label="Apellidos"
              rules={[{ required: true, message: "Ingrese Apellidos" }]}
            >
              <Input placeholder="Ingrese Apellidos" style={style} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="telefono"
              label="Teléfono"
              rules={[{ required: true, message: "Ingrese Teléfono" }]}
            >
              <Input placeholder="Ingrese Teléfono" style={style} />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[
                { required: true, message: "Ingrese Correo electrónico" },
                { type: "email", message: "Ingrese Correo electrónico válido" },
              ]}
            >
              <Input placeholder="Ingrese Correo electrónico" style={style} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={16} xl={16}>
            <Form.Item
              name="direccion"
              label="Dirección"
              rules={[{ required: true, message: "Ingrese Dirección" }]}
            >
              <Input
                showCount
                maxLength={200}
                placeholder="Ingrese Dirección"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="fechaNacimiento"
              label="Fecha de nacimiento"
              rules={[
                { required: true, message: "Seleccione Fecha de nacimiento" },
              ]}
            >
              <DatePicker
                onChange={(date, dateString: any) => {}}
                style={style}
                placeholder="Seleccione Fecha de nacimiento"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="genero"
              label="Género"
              rules={[{ required: true, message: "Seleccione Género" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Género"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={GENEROS}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <Form.Item
              name="estadoCivil"
              label="Estado civil"
              rules={[{ required: true, message: "Seleccione Estado civil" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Estado civil"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={ESTADOS_CIVIL}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider orientation="left">Información de empleo</Divider>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="puesto"
              label="Puesto"
              rules={[
                { required: true, message: "Por favor seleccione el puesto" },
              ]}
            >
              <Select
                style={style}
                options={ROLES}
                placeholder="Seleccione el puesto"
                onChange={(value) => {
                  setShowDriverDetails(value === "Chofer");
                }}
              />
            </Form.Item>
          </Col>

          {showDriverDetails && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="unidadAsignada"
                label="Unidad Asignada"
                // -> Quitamos las reglas ya que podemos registrar un chofer desde el form de unidades y ahi no sera obligatorio la unidad ya que apenas la estamos registrando
                // rules={[
                //   {
                //     required: true,
                //     message: "Por favor seleccione una unidad",
                //   },
                // ]}
              >
                <Select
                  style={style}
                  options={listaDeUnidades}
                  placeholder="Seleccione una unidad"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        block
                        onClick={() => {
                          dispatch(setDetalleDeUnidad(null));
                          dispatch(setOpenDrawerUnidad(true));
                        }}
                      >
                        Agregar nueva unidad
                      </Button>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="estatusActual"
              label="Estatus actual"
              rules={[{ required: true, message: "Seleccione Estatus actual" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Estatus actual"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={ESTATUS_ACTUAL}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="numeroDeSeguroSocial"
              label="Número de seguro social"
              rules={[
                { required: false, message: "Ingrese Número de seguro social" },
              ]}
            >
              <Input
                maxLength={11}
                placeholder="Ingrese Número de seguro social"
                style={style}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="curp"
              label="CURP"
              rules={[{ required: false, message: "Ingrese CURP" }]}
            >
              <Input placeholder="Ingrese CURP" style={style} />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="rfc"
              label="RFC"
              rules={[{ required: false, message: "Ingrese RFC" }]}
            >
              <Input placeholder="Ingrese RFC" style={style} />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="sucursal"
              label="Sucursal"
              rules={[{ required: true, message: "Seleccione Sucursal" }]}
            >
              <Select
                options={SUCURSALES}
                placeholder="Seleccione sucursal"
                style={style}
                showSearch
                optionFilterProp="label"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      block
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        formSucursal.resetFields();
                        dispatch(setOpenDrawerSucursal(true));
                        dispatch(setDetalleDeSucursal(null));
                      }}
                    >
                      Nueva Sucursal
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="fechaRegistroIngreso"
              label="Fecha de registro ó ingreso"
              rules={[
                {
                  required: false,
                  message: "Seleccione Fecha de registro ó ingreso",
                },
              ]}
            >
              <DatePicker
                onChange={() => {}}
                style={style}
                placeholder="Seleccione Fecha de registro ó ingreso"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="fechaDeContrato"
              label="Fecha de contrato"
              rules={[
                { required: false, message: "Seleccione Fecha de contrato" },
              ]}
            >
              <DatePicker
                onChange={() => {}}
                style={style}
                placeholder="Seleccione Fecha de contrato"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="tipoDeContrato"
              label="Tipo de contrato"
              rules={[
                { required: false, message: "Seleccione Tipo de contrato" },
              ]}
            >
              <Select
                style={style}
                placeholder="Seleccione Tipo de contrato"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={TIPO_DE_CONTRATO}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="duracionDelContrato"
              label="Duración del contrato"
              rules={[
                { required: false, message: "Ingrese Duración del contrato" },
              ]}
            >
              <Input
                placeholder="Ingrese Duración del contrato"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="fechaDeFinalizacionDelContrato"
              label="Fecha de finalización del contrato"
              rules={[
                {
                  required: false,
                  message: "Seleccione Fecha de finalización del contrato",
                },
              ]}
            >
              <DatePicker
                onChange={() => {}}
                style={style}
                placeholder="Seleccione Fecha de finalización del contrato"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="supervisorOGerenteAsignado"
              label="Supervisor ó gerente asignado"
              rules={[
                {
                  required: false,
                  message: "Seleccione Supervisor ó gerente asignado",
                },
              ]}
            >
              <Select
                showSearch
                style={style}
                placeholder="Seleccione Supervisor ó gerente asignado"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={TIPO_DE_CONTRATO}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              label="Cargar imagen"
              rules={[{ required: false, message: "Seleccione Cargar imagen" }]}
            >
              <Upload
                accept="image/*"
                listType="picture"
                fileList={fileList}
                maxCount={8}
                onChange={handleChange}
                onPreview={handlePreview}
                beforeUpload={() => false}
                style={style}
              >
                <Button block type="dashed" icon={<FileImageOutlined />}>
                  Cargar imagen
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider orientation="left">Nomina(Opcional)</Divider>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="salarioBase"
              label="Salario base"
              rules={[{ required: false, message: "Ingrese Salario base" }]}
            >
              <Input
                type="number"
                placeholder="Ingrese Salario base"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="tipoDePago"
              label="Tipo de pago"
              rules={[{ required: false, message: "Seleccione Tipo de pago" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Tipo de pago"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={TIPO_DE_PAGO}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="claveBancaria"
              label="Clave bancaria"
              rules={[{ required: false, message: "Ingrese Clave bancaria" }]}
            >
              <Input
                type="number"
                placeholder="Ingrese Clave bancaria"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="deducciones"
              label="Deducciones"
              rules={[{ required: false, message: "Seleccione Deducciones" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Deducciones"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={DEDUCCIONES}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="bonificaciones"
              label="Bonificaciones"
              rules={[
                { required: false, message: "Seleccione Bonificaciones" },
              ]}
            >
              <Select
                style={style}
                placeholder="Seleccione Bonificaciones"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={BONIFICACIONES}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="comisiones"
              label="Comisiones"
              rules={[{ required: false, message: "Seleccione Comisiones" }]}
            >
              <Select
                style={style}
                placeholder="Seleccione Comisiones"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={[]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <Form.Item
              name="prestacionesAdicionales"
              label="Prestaciones adicionales"
              rules={[
                {
                  required: false,
                  message: "Seleccione Prestaciones adicionales",
                },
              ]}
            >
              <Select
                style={style}
                placeholder="Seleccione Prestaciones adicionales"
                optionFilterProp="label"
                onChange={() => {}}
                onSearch={() => {}}
                options={PRESTACIONES_ADICIONALES}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider orientation="left">
            Información para vacaciones: (Opcional)
          </Divider>
          <Col xs={12} sm={12} md={12} lg={8} xl={8}>
            <Form.Item
              name="diasDeVacionesAsignados"
              label="Días de vacaciones asignados "
              rules={[
                {
                  required: false,
                  message: "Ingrese Días de vacaciones asignados ",
                },
              ]}
            >
              <Input
                type="number"
                placeholder="Ingrese Días de vacaciones asignados "
                style={style}
              />
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
                onClick={async () => {
                  const updateListaUsuarios =
                    await FireStoreRecursosHumanos.listarUsuarios({
                      idEmpresa: !auth?.empresa?.isAdmin
                        ? auth?.empresa?.id
                        : "",
                    });
                  dispatch(setListaDeUsuarios(updateListaUsuarios));
                }}
              >
                Guardar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>
      <Drawer
        title={"Nueva unidad"}
        width={720}
        onClose={() => {
          setIsDrawerUnidadesOpen(false);
        }}
        open={isDrawerUnidadesOpen}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <FormUnidades form={formUnidades} />
      </Drawer>
      <Drawer
        title={"Nueva Sucursal"}
        width={768}
        onClose={() => dispatch(setOpenDrawerSucursal(false))}
        open={openDrawerSucursal}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <FormSucursales form={formSucursal} />
      </Drawer>
    </>
  );
};

export default FormColaboradores;
