"use client";
import React from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Dropdown,
  Modal,
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FormOutlined,
  CopyOutlined,
  CheckSquareOutlined,
  CheckOutlined,
  CloudDownloadOutlined,
  SendOutlined,
} from "@ant-design/icons";

import { useRouter } from "next/navigation";
import {
  setDetalleDeCompra,
  setOpenDrawer,
  setRefresh,
} from "@/features/finanzasSlice";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const TableCXC = ({ form }: any) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { loadingTable, listaDeCXC = [] } = useSelector(
    (state: any) => state.finanzas
  );

  console.log("listaDeCXC desde Table:", listaDeCXC);
  const { auth } = useSelector((state: any) => state.configuracion);

  const { listaDeProveedores = [] } = useSelector((state: any) => state.ventas);

  const [loadingLocal, setLoadingLocal] = React.useState(false);

  const getMenuItems = (record: any): any[] => [
    {
      key: "1",
      label: (
        <a
          onClick={async (e) => {
            e.preventDefault();

            const { value: fecha } = await Swal.fire({
              icon: "question",
              title: "Seguro de marcar como pagada?",
              text: "Seleccione fecha de pago",
              input: "date",
              inputAttributes: {
                required: "true",
              },
              inputValidator: (value) => {
                if (!value) {
                  return "Seleccione una fecha válida!";
                }
                return undefined;
              },
            });

            if (fecha) {
              setLoadingLocal(true);
              await FireStoreFinanzas.registrarCXP(auth?.empresa?.id, {
                id: record?.id,
                estatus: "Pagada",
                fechaDePago: fecha,
              });
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `Cuenta marcada como pagada!`,
                showConfirmButton: false,
                timer: 3000,
              });
              setLoadingLocal(false);
              dispatch(setRefresh(Math.random()));
            }
          }}
        >
          Marcar como pagada
        </a>
      ),
      disabled: record?.estatus == "Pagada" ? true : false,
      icon: <CheckOutlined />,
    },
    {
      key: "2",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            showModal();
          }}
        >
          Ver recibo
        </a>
      ),
      icon: <EyeOutlined />,
      disabled: record?.estatus != "Pagada" ? true : false,
    },
    {
      key: "3",
      label: (
        <a
          onClick={async (e) => {
            e.preventDefault();
          }}
        >
          {record?.tipo == "Factura"
            ? "Solicitar factura"
            : "Solicitar nota de crédito"}
        </a>
      ),
      icon: <CopyOutlined />,
      disabled: record?.estatus != "Pendiente" ? true : false,
    },
    /* {
      type: 'divider',
    },
    {
      key: '4',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            title: "Seguro de eliminar compra?",
            text: "",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Desactivado!",
                text: "",
                icon: "success"
              });
            }
          });

        }}>Eliminar compra</a>
      ),
      icon: <DeleteOutlined />,
    }, */
  ];

  const columns: TableProps<any>["columns"] = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de cuentas por pagar, ${listaDeCXC.length} resultados`}</Typography.Title>
      ),
      dataIndex: "cxc",
      key: "cxc",
      children: [
        {
          title: "Código",
          dataIndex: "codigo",
          key: "codigo",
        },
        {
          title: "Fecha de compra",
          dataIndex: "fechaDeCompra",
          key: "fechaDeCompra",
        },
        {
          title: "Tipo de pago",
          dataIndex: "tipo",
          key: "tipo",
        },
        {
          title: "Proveedor",
          dataIndex: "proveedor",
          key: "proveedor",
          render: (text, record, index) => {
            const proveedor =
              listaDeProveedores.find((proveedor: any) => proveedor?.id == text)
                ?.nombreProveedor || "Desconocido";
            return <div>{proveedor}</div>;
          },
        },
        {
          title: "Número de artículos",
          dataIndex: "articulos",
          key: "articulos",
          render: (text, record, index) => (
            <div>{record?.articulos?.length}</div>
          ),
        },
        {
          title: "Total",
          dataIndex: "totalDeLaCompra",
          key: "totalDeLaCompra",
          render: (text, record, index) => (
            <div>{Number(text).toLocaleString("en-US")}</div>
          ),
        },
        {
          title: "Fecha de pago",
          dataIndex: "fechaDePago",
          key: "fechaDePago",
          render: (text, record, index) => <div>{text || ""}</div>,
        },
        {
          title: "Estatus",
          dataIndex: "estatus",
          key: "estatus",
          render: (text, record, index) => (
            <Tag color={["Pagada"].includes(text) ? "success" : "processing"}>
              {text}
            </Tag>
          ),
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
                    loading={loadingLocal}
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

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // handler modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Table
        bordered
        columns={columns}
        loading={loadingTable}
        dataSource={listaDeCXC}
        scroll={{
          x: 768,
        }}
        size="small"
      />
      <Modal
        // loading
        title="Recibo"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Aplicar"
        cancelText="Cerrar"
        footer={null}
      >
        <div style={{ width: "100%", height: "450px" }}></div>
        <div style={{ width: "100%" }}>
          <Button.Group>
            <Button
              onClick={() => {
                /* const a = document.createElement('a');
                a.href = doc?.url;
                a.target = "_blank";
                a.download = doc?.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a); */
              }}
              block
              type="dashed"
              icon={<SendOutlined />}
            >
              Enviar
            </Button>
            <Button
              onClick={async () => {
                /* const a = document.createElement('a');
                a.href = doc?.url;
                a.target = "_blank";
                a.download = doc?.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a); */
              }}
              block
              type="dashed"
              icon={<CloudDownloadOutlined />}
            >
              Descargar archivo
            </Button>
          </Button.Group>
        </div>
      </Modal>
    </>
  );
};

export default TableCXC;
