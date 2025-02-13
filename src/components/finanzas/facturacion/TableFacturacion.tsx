"use client";
import React from "react";
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
import dataFakeFacturacion from "./dataFakeFacturacion";

const TableFacturacion = ({ form }: any) => {
  const getMenuItems = (record: any): any[] => [
    {
      key: "1",
      label: <a onClick={() => alert("Editar Factura")}>Editar Factura</a>,
      icon: <FormOutlined />,
    },
    {
      key: "2",
      label: <a onClick={() => alert("Ver Detalle")}>Ver Detalle</a>,
      icon: <EyeOutlined />,
    },
    {
      key: "3",
      label: <a onClick={() => alert("Eliminar")}>Eliminar</a>,
      icon: <UserOutlined />,
    },
  ];

  const columns: TableProps<any>["columns"] = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de Facturas, ${dataFakeFacturacion.length} resultados`}</Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: "Hora",
          dataIndex: "hora",
          key: "hora",
        },
        {
          title: "Fecha",
          dataIndex: "fecha",
          key: "fecha",
        },
        {
          title: "Estatus",
          dataIndex: "estatus",
          key: "estatus",
          render: (text, record, index) => {
            return text == "Activo" ? (
              <Tag color="success">{text}</Tag>
            ) : (
              <Tag color="processing">{text}</Tag>
            );
          },
        },
        {
          title: "Responsable",
          dataIndex: "responsable",
          key: "responsable",
        },
        {
          title: "Total",
          dataIndex: "total",
          key: "total",
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
                    // loading={loading}
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

  return (
    <Table
      bordered
      // loading={loadingTable}
      columns={columns}
      dataSource={dataFakeFacturacion}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableFacturacion;
