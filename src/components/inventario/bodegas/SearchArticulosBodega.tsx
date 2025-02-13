"use client";

import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FilterOutlined } from "@ant-design/icons";
import { setListaDeArticulos } from "@/features/inventarioSlice";

const { Search } = Input;
const { Option } = Select;

interface FiltersState {
  categoriaSelected: string | null;
  familiaSelected: string | null;
  provedoresSelected: string[];
  marcaSelected: string | null;
  estatusSelected: boolean[];
}

const SearchArticulosBodega = () => {
  const countSelectedFilters = () => {
    let count = 0;

    if (filters.categoriaSelected) count++;
    if (filters.familiaSelected) count++;
    if (filters.provedoresSelected.length >= 1) count++;
    if (filters.marcaSelected) count++;
    if (filters.estatusSelected.length >= 1) count++;

    return count;
  };

  const ESTADOS = [
    { label: "Activo", value: true },
    { label: "Inactivo", value: false },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    categoriaSelected: null,
    familiaSelected: null,
    provedoresSelected: [],
    marcaSelected: null,
    estatusSelected: [],
  });

  const dispatch = useDispatch();
  const { listaDeArticulos, subCollectionEmpresa } = useSelector(
    (state: any) => state.inventario
  );

  const {
    categorias = [],
    familias = [],
    provedores = [],
    marcas = [],
  } = subCollectionEmpresa;

  // Copia original de los artículos para restaurar si se quitan los filtros
  const [originalArticulos, setOriginalArticulos] = useState(listaDeArticulos);

  useEffect(() => {
    if (originalArticulos.length === 0 && listaDeArticulos.length > 0) {
      setOriginalArticulos(listaDeArticulos);
    }
  }, [listaDeArticulos]);

  useEffect(() => {
    const filterArticulos = () => {
      let filteredArticulos = originalArticulos;

      if (search) {
        filteredArticulos = filteredArticulos.filter(
          (articulo: any) =>
            articulo.codigoArticulo
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            articulo.descripcion.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (filters.categoriaSelected) {
        filteredArticulos = filteredArticulos.filter(
          (articulo: any) => articulo.categoria === filters.categoriaSelected
        );
      }

      if (filters.familiaSelected) {
        filteredArticulos = filteredArticulos.filter(
          (articulo: any) => articulo.familia === filters.familiaSelected
        );
      }

      if (filters.provedoresSelected.length) {
        filteredArticulos = filteredArticulos.filter((articulo: any) =>
          filters.provedoresSelected.some((prov) =>
            articulo.provedoresArticulo.includes(prov)
          )
        );
      }

      if (filters.marcaSelected) {
        filteredArticulos = filteredArticulos.filter(
          (articulo: any) => articulo.marca === filters.marcaSelected
        );
      }

      if (filters.estatusSelected.length) {
        filteredArticulos = filteredArticulos.filter((articulo: any) =>
          filters.estatusSelected.includes(articulo.estatus === "Activo")
        );
      }

      // Si no se aplicaron filtros ni búsqueda, usa la lista original
      dispatch(setListaDeArticulos(filteredArticulos));
    };

    filterArticulos();
  }, [search, filters, dispatch, originalArticulos]);

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={{ width: "100%" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Buscar por el código o nombre del producto..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="large"
            block
            icon={<FilterOutlined />}
          >
            <Badge count={countSelectedFilters()}>Filtrar</Badge>
          </Button>
        </Col>
      </Row>
      <Modal
        title="Filtrar artículos de la bodega"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item
            label={<Typography.Text strong>Estado</Typography.Text>}
            colon={false}
          >
            <Checkbox.Group
              options={ESTADOS}
              value={filters.estatusSelected}
              onChange={(values) =>
                setFilters({ ...filters, estatusSelected: values })
              }
              style={{ display: "flex", flexDirection: "column" }}
            />
          </Form.Item>
          <Form.Item
            label={<Typography.Text strong>Categoría</Typography.Text>}
            colon={false}
          >
            <Select
              allowClear
              value={filters.categoriaSelected}
              onChange={(value) =>
                setFilters({ ...filters, categoriaSelected: value })
              }
              style={{ width: "100%" }}
              placeholder="Selecciona la categoría"
            >
              {categorias.map((categoria: any) => (
                <Option key={categoria.id} value={categoria.value}>
                  {categoria.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<Typography.Text strong>Familia</Typography.Text>}
            colon={false}
          >
            <Select
              allowClear
              value={filters.familiaSelected}
              onChange={(value) =>
                setFilters({ ...filters, familiaSelected: value })
              }
              style={{ width: "100%" }}
              placeholder="Selecciona la familia"
            >
              {familias.map((familia: any) => (
                <Option key={familia.value} value={familia.value}>
                  {familia.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<Typography.Text strong>Proveedores</Typography.Text>}
            colon={false}
          >
            <Select
              mode="multiple"
              allowClear
              value={filters.provedoresSelected}
              onChange={(values) =>
                setFilters({ ...filters, provedoresSelected: values })
              }
              style={{ width: "100%" }}
              placeholder="Selecciona los proveedores"
            >
              {provedores.map((proveedor: any) => (
                <Option key={proveedor.id} value={proveedor.value}>
                  {proveedor.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<Typography.Text strong>Marca</Typography.Text>}
            colon={false}
          >
            <Select
              allowClear
              value={filters.marcaSelected}
              onChange={(value) =>
                setFilters({ ...filters, marcaSelected: value })
              }
              style={{ width: "100%" }}
              placeholder="Selecciona la marca"
            >
              {marcas.map((marca: any) => (
                <Option key={marca.value} value={marca.value}>
                  {marca.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SearchArticulosBodega;
