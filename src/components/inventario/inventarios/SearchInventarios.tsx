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
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import {
  setListaDeArticulos,
  setListaDeInventarios,
  setListaDeSucursales,
  setListaDeUnidadesVehiculares,
} from "@/features/inventarioSlice";
import FireStoreLogistica from "@/firebase/FireStoreLogistica";

interface FiltersState {
  sucursalSelected: string[];
  articuloSelected: string[];
}

const SearchInventarios = () => {
  const ESTADOS = [
    { label: "Activo", value: true },
    { label: "Inactivo", value: false },
  ];
  const { Search } = Input;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    sucursalSelected: [],
    articuloSelected: [],
  });
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const {
    listaDeSucursales,
    listaDeArticulos,
    listaDeInventarios,
    listaDeUnidadesVehiculares,
  } = useSelector((state: any) => state.inventario);

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;

    const fetchSucursales = async () => {
      if (!idEmpresa) return;
      const sucursales = await FireStoreConfiguracion.listarSucursales({
        idEmpresa,
      });
      dispatch(setListaDeSucursales(sucursales));
    };

    const fetchArticulos = async () => {
      if (!idEmpresa) return;
      const articulos = await FireStoreInventario.listarArticulos({
        idEmpresa,
      });
      dispatch(setListaDeArticulos(articulos));
    };

    const fetchUnidadesVehiculares = async () => {
      if (!idEmpresa) return;
      const unidadesVehiculares = await FireStoreLogistica.listarUnidades(
        idEmpresa
      );
      dispatch(setListaDeUnidadesVehiculares(unidadesVehiculares));
    };

    fetchSucursales();
    fetchArticulos();
    fetchUnidadesVehiculares();
  }, [auth, dispatch]);

  const [originalListaDeInventarios, setOriginalListaDeInventarios] = useState<
    any[]
  >([]);

  useEffect(() => {
    if (!originalListaDeInventarios.length && listaDeInventarios.length) {
      setOriginalListaDeInventarios(listaDeInventarios);
    }
  }, [listaDeInventarios]);

  useEffect(() => {
    const filterInventarios = () => {
      let filteredInventarios = [...originalListaDeInventarios];

      if (search) {
        filteredInventarios = filteredInventarios.filter(
          (item: any) =>
            item.codigoInventario?.includes(search) ||
            item.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
            item.sucursal?.nombre
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            item.articulos?.some((articulo: any) =>
              articulo.descripcion?.toLowerCase().includes(search.toLowerCase())
            )
        );
      }

      if (filters.sucursalSelected.length) {
        filteredInventarios = filteredInventarios.filter(
          (item: any) =>
            (item.sucursal_id &&
              filters.sucursalSelected.includes(item.sucursal_id)) ||
            (item.unidad_id &&
              filters.sucursalSelected.includes(item.unidad_id))
        );
      }

      if (filters.articuloSelected.length) {
        console.log("Entro aqui!");
        filteredInventarios = filteredInventarios.filter((item: any) =>
          filters.articuloSelected.includes(item.articulo_id)
        );
      }

      dispatch(setListaDeInventarios(filteredInventarios));
    };

    filterInventarios();
  }, [search, filters, dispatch, originalListaDeInventarios]);

  const countSelectedFilters = () =>
    [filters.articuloSelected, filters.sucursalSelected].filter(
      (arr) => arr.length
    ).length;

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={{ width: "100%" }}>
        <Col xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Busca por el código del inventario o por artículo"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={6} xl={6} style={{ display: "flex" }}>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="large"
            block
            icon={<FilterOutlined />}
          >
            <Badge count={countSelectedFilters()}>Filtrar</Badge>
          </Button>
        </Col>
        <Modal
          title="Filtrar inventarios"
          open={isModalOpen}
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form layout="vertical">
            <Form.Item
              label={
                <Typography.Text strong>Sucursal / Unidad</Typography.Text>
              }
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Seleccione las sucursales o unidades"
                onChange={(e) =>
                  setFilters({ ...filters, sucursalSelected: e })
                }
                options={[
                  ...listaDeSucursales,
                  ...listaDeUnidadesVehiculares,
                ].map((s: any) => ({
                  label: s.marca ? `${s.marca} ${s.modelo}` : s.nombre,
                  value: s.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              label={<Typography.Text strong>Artículos</Typography.Text>}
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Seleccione los artículos"
                onChange={(e) =>
                  setFilters({ ...filters, articuloSelected: e })
                }
                options={listaDeArticulos.map((a: any) => ({
                  label: a.descripcion,
                  value: a.id,
                }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Row>
    </Card>
  );
};

export default SearchInventarios;
