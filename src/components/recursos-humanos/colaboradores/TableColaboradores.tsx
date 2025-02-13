"use client";
import React from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import SkeletonUsuarios from "./SkeletonColaboradores";
import {
  Avatar,
  Button,
  Dropdown,
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  MoreOutlined,
  FormOutlined,
} from "@ant-design/icons";
import {
  setOpenDrawer,
  setPageListaDeUsuarios,
  setPerfilUsuario,
  setLoadingTable,
  setRefresh,
} from "@/features/recursosHumanosSlice";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useCrearCuentaMutation } from "@/services/recursosHumanosApi";
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import {
  setListaDeSucursales,
  setDetalleDeSucursal,
} from "@/features/configuracionSlice";
import { enviarEmail } from "@/helpers/email";
import { generateRandomAlphanumeric } from "@/helpers/functions";

dayjs.extend(customParseFormat);

const TableColaboradores = ({ form }: any) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = React.useState(false);
  const { auth, refresh, listaDeSucursales } = useSelector(
    (state: any) => state.configuracion
  );

  const [crearCuenta, { data, isLoading, error }] = useCrearCuentaMutation();

  const {
    loadingTable,
    listaDeUsuarios = [],
    countListaDeUsuarios,
    pageListaDeUsuarios,
  } = useSelector((state: any) => state.recursosHumanos);

  // Lista de sucursales (bodegas)
  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreConfiguracion.listarSucursales({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeSucursales: any) => {
        dispatch(setListaDeSucursales(listaDeSucursales));
      });
    }
  }, [auth, refresh]);

  // 1. Función para eliminar record
  const eliminarColaborador = async (record: any) => {
    try {
      // Modifica el objeto para asignarle un nuevo ID (Firebase lo puede generar automáticamente)
      const colaborador = { ...record };

      dispatch(setLoadingTable(true));
      // Llamada a Firebase para crear el nuevo artículo
      await FireStoreRecursosHumanos.eliminarUsuario({
        idEmpresa: auth?.empresa?.id,
        ...colaborador,
      });

      // Muestra mensaje de éxito
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Colaborador eliminado con éxito!`,
        showConfirmButton: false,
        timer: 3000,
      });

      // Refresca la tabla llamando al setRefresh o una acción similar
      dispatch(setRefresh(Math.random()));
    } catch (error) {
      console.error("Error eliminando colaborador:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar colaborador",
        icon: "error",
      });
    }
  };

  const getMenuItems = (record: any): any[] => [
    {
      key: "1",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();

            form.resetFields();

            const {
              fechaNacimiento,
              fechaRegistroIngreso,
              fechaDeContrato,
              fechaDeFinalizacionDelContrato,
              ...others
            } = record;

            form.setFieldsValue({
              ...others,
              fechaNacimiento: fechaNacimiento
                ? dayjs(fechaNacimiento, "YYYY-MM-DD")
                : "",
              fechaRegistroIngreso: fechaRegistroIngreso
                ? dayjs(fechaRegistroIngreso, "YYYY-MM-DD")
                : "",
              fechaDeContrato: fechaDeContrato
                ? dayjs(fechaDeContrato, "YYYY-MM-DD")
                : "",
              fechaDeFinalizacionDelContrato: fechaDeFinalizacionDelContrato
                ? dayjs(fechaDeFinalizacionDelContrato, "YYYY-MM-DD")
                : "",
            });

            dispatch(
              setPerfilUsuario({
                ...others,
                fechaNacimiento: fechaNacimiento
                  ? dayjs(fechaNacimiento, "YYYY-MM-DD")
                  : "",
                fechaRegistroIngreso: fechaRegistroIngreso
                  ? dayjs(fechaRegistroIngreso, "YYYY-MM-DD")
                  : "",
                fechaDeContrato: fechaDeContrato
                  ? dayjs(fechaDeContrato, "YYYY-MM-DD")
                  : "",
                fechaDeFinalizacionDelContrato: fechaDeFinalizacionDelContrato
                  ? dayjs(fechaDeFinalizacionDelContrato, "YYYY-MM-DD")
                  : "",
              })
            );
            dispatch(setOpenDrawer(true));
          }}
        >
          Editar colaborador
        </a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: "2",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            dispatch(setPerfilUsuario(record));
            router.push(`/recursos-humanos/colaboradores/${record?.id}`);
          }}
        >
          Ver perfil completo
        </a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: "3",
      label: (
        <a
          onClick={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const tempPassword = generateRandomAlphanumeric();
              const response = await crearCuenta({
                email: record?.email,
                password: tempPassword,
                displayName: `${record?.nombres} ${record?.apellidos}`,
              }).unwrap();

              if (response.success) {
                // Send welcome email with credentials
                await enviarEmail({
                  to: record?.email,
                  subject: "Bienvenido a SmartRoute - Credenciales de Acceso",
                  plantilla: "generarPlantillaHTMLNuevoUsuario",
                  nombreColaborador: `${record?.nombres} ${record?.apellidos}`,
                  correoElectronico: record?.email,
                  contrasenaTemp: tempPassword,
                  nombreEmpresa: auth?.empresa?.nombre || "SmartRoute",
                  linkInicioSesion: window.location.origin + "/empresas/login",
                });

                await FireStoreRecursosHumanos.registrarUsuario({
                  id: record?.id,
                  tmpKey: tempPassword,
                  firebaseUID: response?.data?.uid,
                });

                Swal.fire({
                  title: "¡Cuenta creada con éxito!",
                  text: "Se ha enviado un correo con las credenciales al colaborador.",
                  icon: "success",
                });
              }
            } catch (error: any) {
              // console.log('Error:', error);
              const { data } = { ...error };
              console.log("Data: ", data);
              console.log("El if", data?.error?.includes("email address"));
              if (data?.error?.includes("email address")) {
                Swal.fire({
                  title: "Aviso",
                  text: "El correo electrónica ya se encuentra registrado",
                  icon: "warning",
                });
              } else {
                Swal.fire({
                  title: "Error",
                  text: "No se pudo crear la cuenta. Por favor, intente nuevamente.",
                  icon: "error",
                });
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          Crear cuenta
        </a>
      ),
      icon: <UserOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            Swal.fire({
              title: "Seguro de desactivar colaborador?",
              text: "",
              icon: "question",
              showCancelButton: true,
              confirmButtonColor: "#1677ff",
              cancelButtonColor: "#d33",
              confirmButtonText: "Si",
              cancelButtonText: "No",
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.fire({
                  title: "Desactivado!",
                  text: "",
                  icon: "success",
                });
              }
            });
          }}
        >
          Desactivar colaborador
        </a>
      ),
      icon: <DeleteOutlined />,
    },
  ];

  const columns: TableProps<any>["columns"] = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de colaboradores, ${listaDeUsuarios.length} resultados`}</Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: "N°",
          dataIndex: "numero",
          key: "numero",
          width: 50,
          render: (text, record, index) => <div>{index + 1}</div>,
        },
        {
          title: "Nombres",
          dataIndex: "nombres",
          key: "nombres",
          render: (text, record, index) => {
            return record?.photoURL ? (
              <div>
                {/* <Avatar src={<img src={record?.photoURL} alt="avatar" />} /> */}
                <span>{`${record?.nombres} ${record?.apellidos}`}</span>
              </div>
            ) : (
              <div>
                {/* <Avatar icon={<UserOutlined />} /> */}
                <span>{`${record?.nombres} ${record?.apellidos}`}</span>
              </div>
            );
          },
        },
        {
          title: "Rol",
          dataIndex: "puesto",
          key: "puesto",
        },
        {
          title: "Sucursal",
          dataIndex: "sucursal",
          key: "sucursal",
          render: (text, record, index) => {
            return (
              <div>
                {listaDeSucursales.find((sucursal: any) => sucursal?.id == text)
                  ?.direccion || text}
              </div>
            );
          },
        },
        {
          title: "Teléfono",
          dataIndex: "telefono",
          key: "telefono",
          render: (text, record, index) => <a href={`tel:${text}`}>{text}</a>,
        },
        {
          title: "Email",
          dataIndex: "email",
          key: "email",
          render: (text, record, index) => (
            <a href={`mailto:${text}`}>{text}</a>
          ),
        },
        {
          title: "Estatus",
          dataIndex: "estatusActual",
          key: "estatusActual",
          render: (text, record, index) => {
            return text == "Activo" ? (
              <Tag color="success">{text}</Tag>
            ) : (
              <Tag color="processing">{text}</Tag>
            );
          },
        },
        {
          title: "",
          align: "center",
          width: 50,
          render: (_, record) => {
            return (
              <Dropdown
                menu={{
                  items: getMenuItems(record),
                }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Tooltip title="Acciones">
                  <Button
                    loading={loading}
                    shape="circle"
                    icon={<MoreOutlined />}
                  />
                </Tooltip>
              </Dropdown>
            );
          },
        },
      ],
    },
  ];

  // if (loadingTable) {
  //   return <SkeletonUsuarios />;
  // }

  return (
    <Table
      bordered
      loading={loadingTable}
      columns={columns}
      dataSource={listaDeUsuarios}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableColaboradores;
