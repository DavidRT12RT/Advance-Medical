import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Row,
  Select,
  Table,
  InputNumber,
  Tooltip,
  Form,
} from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { Articulo } from "./FormDrawerTransferencias";

interface DynamicTableArticulos {
  dataSource: Articulo[];
  showActions: boolean;
  handleAddArticuloInArray: () => void;
  handleDeleteArticuloInArray: (id: number) => void;
  handleUpdateArticuloInArray: (key: number, field: string, value: any) => void;
  isDisabled?: boolean;
}

const DynamicTableArticulos = ({
  dataSource,
  showActions,
  handleAddArticuloInArray,
  handleDeleteArticuloInArray,
  handleUpdateArticuloInArray,
  isDisabled = false,
}: DynamicTableArticulos) => {

  const { listaDeArticulos } = useSelector((state: any) => state.inventario);

  const columns = [
    {
      title: "Artículo",
      dataIndex: "articulo",
      key: "articulo",
      align: "center",
      width: 250,
      render: (value: any, record: any) => (
        <Select
          placeholder="Seleccione un artículo"
          value={value}
          disabled={isDisabled}
          onChange={(val) =>
            handleUpdateArticuloInArray(record.key, "articulo", val)
          }
          options={listaDeArticulos.map((articulo: any) => ({
            label: articulo.descripcion,
            value: articulo.id,
          }))}
        />
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "center",
      render: (value: any, record: any) => (
        <InputNumber
          min={1}
          value={value}
          disabled={isDisabled}
          onChange={(val) =>
            handleUpdateArticuloInArray(record.key, "cantidad", val)
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Acciones",
      key: "action",
      render: (_: any, record: any) => (
        <Tooltip title="Eliminar">
          <Button
            size="small"
            type="dashed"
            danger
            shape="circle"
            icon={<MinusCircleOutlined />}
            onClick={() => handleDeleteArticuloInArray(record.key)}
            disabled={isDisabled}
          />
        </Tooltip>
      ),
    },
  ];

  const style: React.CSSProperties = { width: "100%", marginBottom: "0px" };

  return (
    <Row gutter={4}>
      <Divider>Lista de artículos a transferir {dataSource?.length}</Divider>
      <Col xs={24}>
        <div
          style={{
            width: "100%",
            maxHeight: "50vh",
            overflowY: "auto",
            display: dataSource.length === 0 ? "none" : "block",
          }}
        >
          <Table
            bordered
            pagination={false}
            //@ts-ignore
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 425 }}
            size="small"
            rowKey="key"
          />
        </div>
      </Col>
      <Col xs={24}>
        <div style={{ ...style, textAlign: "center", marginTop: "1rem" }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddArticuloInArray}
            disabled={isDisabled}
          >
            Agregar Fila
          </Button>
        </div>
      </Col>
      <Divider />
    </Row>
  );
};

export default DynamicTableArticulos;
