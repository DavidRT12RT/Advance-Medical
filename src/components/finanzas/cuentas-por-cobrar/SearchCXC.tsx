"use client";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterOutlined } from "@ant-design/icons";
import {
  setListaDeCXC,
  setListaDeVentas,
  setLoadingTable,
} from "@/features/finanzasSlice";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import "../../../app/finanzas.css";
import esES from "antd/lib/locale/es_ES";

const ESTADOS = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "Pagada", value: "Pagada" },
];

const { Search } = Input;

const style: React.CSSProperties = { width: "100%" };

const SearchCXC = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [originalListaCXC, setOriginalListaCXC] = useState<any[]>([]);
  const [search, setSearch] = React.useState("");

  const { auth } = useSelector((state: any) => state.configuracion);

  const { refresh } = useSelector((state: any) => state.finanzas);

  const { listaDeProveedores = [] } = useSelector((state: any) => state.ventas);

  const PROVEEDORES = listaDeProveedores.map((proveedor: any) => {
    return {
      ...proveedor,
      label: proveedor?.nombreProveedor,
      value: proveedor?.id,
    };
  });

  useEffect(() => {
    if (!auth?.empresa?.id) return;

    dispatch(setLoadingTable(true));
    const listarDatos = async () => {
      try {
        const idEmpresa = !auth?.empresa?.isAdmin ? auth?.empresa?.id : "";
        const listaCXC = await FireStoreFinanzas.listarCXP({ idEmpresa });
        console.log("Aqui listaCXC:", listaCXC);
        setOriginalListaCXC(listaCXC);
        dispatch(setListaDeCXC(listaCXC));
      } catch (error) {
        console.error("Error al listar cuentas por cobrar:", error);
        message.error("Error al cargar cuentas por cobrar");
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    listarDatos();
  }, [auth, refresh]);

  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const onChange = (checkedValues: any) => {
    setSelectedStates(checkedValues);
  };

  // HANDLER SELECT
  const [selectedProveedor, setSelectedProveedor] = React.useState<any[]>([]);
  const onChangeProveedor = (value: any) => {
    console.log(value);
    setSelectedProveedor(value);
  };

  // HANDLER SELECT
  const [selectedFechas, setSelectedFechas] = React.useState<any[]>([]);
  const handleRangeChange = (dates: any, dateStrings: any) => {
    console.log(dates);
    if (dates) setSelectedFechas(dates);
    else setSelectedFechas([]);
  };

  useEffect(() => {
    if (originalListaCXC.length === 0) return;

    let filtered = [...originalListaCXC];

    // Filtro de búsqueda
    if (search) {
      filtered = filtered.filter((cuenta) =>
        cuenta.codigo?.toLowerCase().includes(search)
      );
    }

    // Filtro de estatus
    if (selectedStates.length > 0) {
      filtered = filtered.filter((cuenta) =>
        selectedStates.includes(cuenta.estatus)
      );
    }

    // Filtros de Proveedor
    if (selectedProveedor.length > 0) {
      filtered = filtered.filter((cuenta) =>
        cuenta.proveedor.some((provId: string) =>
          selectedProveedor.includes(provId)
        )
      );
    }

    //Filtros de Fecha
    // if (selectedFechas.length > 0) {
    //   filtered = filtered.filter((cuenta) =>
    //     selectedFechas.includes(cuenta.fechaDeCompra)
    //   );
    // }

    dispatch(setListaDeCXC(filtered));
  }, [
    search,
    selectedStates,
    selectedProveedor,
    selectedFechas,
    originalListaCXC,
  ]);

  const handleSearch = (value: string) => {
    setSearch(value.toLowerCase());
  };

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
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Buscar por Código"
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={style}
          />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className="filtrar" style={{ width: "100%" }}>
            <Badge count={selectedStates.length + selectedProveedor.length}>
              <Button
                onClick={() => {
                  showModal();
                }}
                size="large"
                block
                icon={<FilterOutlined />}
              >
                Filtrar
              </Button>
            </Badge>
          </div>
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            title="Filtrar cuentas por cobrar"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Aplicar"
            cancelText="Cerrar"
            footer={null}
          >
            <ConfigProvider locale={esES}>
              <Form layout="vertical">
                <Form.Item
                  label={<Typography.Text strong>Estatus</Typography.Text>}
                  colon={false}
                >
                  <Checkbox.Group
                    options={ESTADOS}
                    value={selectedStates}
                    onChange={onChange}
                    style={{ display: "flex", flexDirection: "column" }} // Disposición vertical
                  />
                </Form.Item>

                <Form.Item
                  label={<Typography.Text strong>Proveedores</Typography.Text>}
                  colon={false}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={style}
                    placeholder="Seleccione proveedor"
                    onChange={onChangeProveedor}
                    options={PROVEEDORES}
                  />
                </Form.Item>

                <Form.Item
                  label={<Typography.Text strong>Fechas</Typography.Text>}
                  colon={false}
                >
                  <DatePicker.RangePicker
                    style={style}
                    onChange={handleRangeChange}
                  />
                </Form.Item>
              </Form>
            </ConfigProvider>
          </Modal>
        </Col>
      </Row>
    </Card>
  );
};

export default SearchCXC;
