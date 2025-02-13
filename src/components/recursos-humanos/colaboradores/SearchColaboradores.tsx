"use client";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterOutlined } from "@ant-design/icons";
import {
  setCountListaDeUsuarios,
  setListaDeUsuarios,
  setLoadingTable,
  setRefresh,
} from "@/features/recursosHumanosSlice";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import { ESTATUS_ACTUAL, ROLES } from "../colaboradores/FormColaboradores";
import "../../../app/finanzas.css";

const { Search } = Input;

const style: React.CSSProperties = { width: "100%" };

const SearchColaboradores = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [originalColaboradores, setOriginalColaboradores] = useState<any[]>([]);
  const { refresh } = useSelector((state: any) => state.recursosHumanos);
  const { auth, listaDeSucursales = [] } = useSelector(
    (state: any) => state.configuracion
  );

  // Estados para los filtros
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const [selectPuesto, setSelectPuesto] = React.useState<any[]>([]);
  const [selectSucursal, setSelectSucursal] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  // Obtener datos iniciales
  useEffect(() => {
    if (!auth?.empresa?.id) return;

    dispatch(setLoadingTable(true));
    const listarDatos = async () => {
      try {
        const idEmpresa = !auth?.empresa?.isAdmin ? auth?.empresa?.id : "";
        const colaboradores = await FireStoreRecursosHumanos.listarUsuarios(
          idEmpresa
        );
        setOriginalColaboradores(colaboradores);
      } catch (error) {
        console.error("Error al listar colaboradores:", error);
        message.error("Error al cargar colaboradores");
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    listarDatos();
  }, [auth, refresh]); //auth

  // Aplicar todos los filtros
  useEffect(() => {
    if (originalColaboradores.length === 0) return;

    let filtered = [...originalColaboradores];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nombres?.toLowerCase().includes(searchTerm) ||
          user.apellidos?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de estatus
    if (selectedStates.length > 0) {
      filtered = filtered.filter((user) =>
        selectedStates.includes(user.estatusActual)
      );
    }

    // Filtro de puesto
    if (selectPuesto.length > 0) {
      filtered = filtered.filter((user) => selectPuesto.includes(user.puesto));
    }

    // Filtro de sucursal
    if (selectSucursal.length > 0) {
      filtered = filtered.filter((user) =>
        selectSucursal.includes(user.sucursal)
      );
    }

    dispatch(setListaDeUsuarios(filtered));
  }, [
    searchTerm,
    selectedStates,
    selectPuesto,
    selectSucursal,
    originalColaboradores,
  ]);

  const handleSearch = (value: string) => {
    setSearchTerm(value.toLowerCase());
  };

  const onChangeEstatus = (values: any) => {
    setSelectedStates(values);
  };

  const onChangePuesto = (value: any) => {
    setSelectPuesto(value);
  };

  const onChangeSucursal = (value: any) => {
    setSelectSucursal(value);
  };

  const SUCURSALES = listaDeSucursales.map((sucursal: any) => ({
    label: sucursal.nombre,
    value: sucursal.id,
  }));

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Buscar por Nombres"
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={style}
          />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className="filtrar" style={{ width: "100%" }}>
            <Badge
              count={
                selectedStates.length +
                (selectPuesto?.length ? 1 : 0) +
                (selectSucursal.length ? 1 : 0)
              }
            >
              <Button
                onClick={() => setIsModalOpen(true)}
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
            title="Filtrar colaboradores"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form layout="vertical">
              <Form.Item label="Estatus" colon={false}>
                <Checkbox.Group
                  options={ESTATUS_ACTUAL}
                  value={selectedStates}
                  onChange={onChangeEstatus}
                  style={{ display: "flex", flexDirection: "column" }}
                />
              </Form.Item>

              <Form.Item label="Rol" colon={false}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Seleccione rol"
                  onChange={onChangePuesto}
                  options={ROLES}
                />
              </Form.Item>

              <Form.Item label="Sucursal" colon={false}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Seleccione sucursal"
                  onChange={onChangeSucursal}
                  options={SUCURSALES}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  );
};

export default SearchColaboradores;
