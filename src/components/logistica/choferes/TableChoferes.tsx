"use client";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Button, Dropdown, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import SkeletonUsuarios from "@/components/recursos-humanos/colaboradores/SkeletonColaboradores";
import {
  CopyOutlined,
  DeleteOutlined,
  FormOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  setLoadingTable,
  setOpenDrawer,
  setPerfilUsuario,
  setRefresh,
} from "@/features/recursosHumanosSlice";
import fireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";

const TableChoferes = ({ form }: any) => {
  const dispatch = useDispatch();
  const { loadingTable, listaDeUsuarios = [] } = useSelector(
    (state: any) => state.recursosHumanos
  );
  const listaDeUnidades =
    useSelector((state: any) => state.finanzas.listaDeUnidades) || [];
  const listaDeSucursales =
    useSelector((state: any) => state.configuracion.listaDeSucursales) || [];
  const choferes = listaDeUsuarios.filter(
    (usuario: any) => usuario.puesto === "Chofer"
  );

  const handleAction = (action: string, record: any) => {
    switch (action) {
      case "edit":
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
        break;
      case "delete":
        Swal.fire({
          title: "Seguro que quieres eliminar este Chofer?",
          text: "",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#1677ff",
          confirmButtonText: "Si",
          cancelButtonText: "No",
        }).then(async (result) => {
          if (result.isConfirmed) {
            dispatch(setLoadingTable(true));
            try {
              const res =
                await fireStoreRecursosHumanos.eliminarUsuarioConRolChofer(
                  record.id
                );
              dispatch(setRefresh(Math.random()));
              Swal.fire({
                title: "Eliminado!",
                text: "",
                icon: "success",
              });
            } catch (error) {
              console.error("Error eliminando chofer:", error);
              Swal.fire({
                title: "Error",
                text: "No se pudo eliminar el usuario. Intenta de nuevo.",
                icon: "error",
              });
            } finally {
              dispatch(setLoadingTable(false));
            }
          }
        });
        break;
      default:
        break;
    }
  };

  const getMenuItems = (record: any) => [
    {
      key: "edit",
      label: "Editar",
      onClick: () => handleAction("edit", record),
      icon: <FormOutlined />,
    },
    {
      key: "delete",
      label: "Eliminar",
      onClick: () => handleAction("delete", record),
      danger: true,
      icon: <DeleteOutlined />,
    },
  ];

  const columns = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de choferes, ${choferes.length} resultados`}</Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: "N°",
          dataIndex: "numero",
          key: "numero",
          width: 50,
          render: (text: any, record: any, index: any) => (
            <div>{index + 1}</div>
          ),
        },
        {
          title: "Nombre",
          dataIndex: "nombres",
          key: "nombre",
        },
        {
          title: "Unidad",
          dataIndex: "unidadAsignada",
          key: "unidadAsignada",
          render: (text: string, record: any) => {
            const unidad = listaDeUnidades.find(
              (unidad: any) => unidad.id === text
            );
            return unidad ? unidad.marca : "- - -";
          },
        },
        {
          title: "Bodega",
          dataIndex: "sucursal",
          key: "sucursal",
          render: (text: string) => {
            const sucursal = listaDeSucursales.find(
              (sucursal: any) => sucursal.id === text
            );
            return sucursal ? sucursal.nombre : "- - -";
          },
        },
        {
          title: "Ruta",
          dataIndex: "direccion",
          key: "direccion",
        },
        {
          title: "Estatus",
          dataIndex: "estatusActual",
          key: "estatusActual",
          render: (text: any, record: any, index: any) => {
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
          render: (_: any, record: any) => (
            <Dropdown
              menu={{ items: getMenuItems(record) }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Tooltip title="Acciones">
                <Button shape="circle" icon={<MoreOutlined />} />
              </Tooltip>
            </Dropdown>
          ),
        },
      ],
    },
  ];

  // if (loadingTable) {
  //   return <SkeletonUsuarios />;
  // } else {
  // }
  return (
    <Table
      columns={columns}
      dataSource={choferes}
      loading={loadingTable}
      rowKey={(record) => record.id}
      size="small"
    />
  );
};

export default TableChoferes;
