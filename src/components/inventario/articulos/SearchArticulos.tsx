"use client";
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
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterOutlined } from "@ant-design/icons";
import {
  setListaDeArticulos,
  setEspecEmpresa,
  setLoadingTable,
  setSubCollectionEmpresa,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";
const { Search } = Input;

const style: React.CSSProperties = { width: "100%" };

interface FiltersState {
  categoriaSelected: string | null;
  familiaSelected: string | null;
  marcaSelected: string | null;
  estatusSelected: boolean[];
}

const SearchArticulos = () => {
  const [filters, setFilters] = useState<FiltersState>({
    categoriaSelected: null,
    familiaSelected: null,
    marcaSelected: null,
    estatusSelected: [],
  });

  const countSelectedFilters = () => {
    let count = 0;

    if (filters.categoriaSelected) count++;
    if (filters.familiaSelected) count++;
    if (filters.marcaSelected) count++;
    if (filters.estatusSelected.length >= 1) count++;

    return count;
  };

  const ESTADOS = [
    { label: "Activo", value: true },
    { label: "Inactivo", value: false },
  ];

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const { auth } = useSelector((state: any) => state.configuracion);

  const { listaDeArticulos, refresh, detalleCatalogo, subCollectionEmpresa } =
    useSelector((state: any) => state.inventario);

  const articulosMethod = React.useRef<any>();
  const articulosParams = React.useRef<any>();

  const [loadingDependencias, setLoadingDependencias] = React.useState(false);

  React.useEffect(() => {
    if (auth?.empresa /* && fetchFB.current */) {
      dispatch(setLoadingTable(true));
      articulosMethod.current = FireStoreInventario.listarArticulos.bind(null);
      articulosParams.current = { idEmpresa: auth?.empresa?.id || "" };
      if (detalleCatalogo) {
        articulosMethod.current =
          FireStoreInventario.listarArticulosPorCatalogo.bind(
            auth?.empresa?.id
          );
        articulosParams.current = (detalleCatalogo?.articulos || []).map(
          (articulo: any) => {
            return articulo?.id;
          }
        );
        articulosParams.current = articulosParams.current?.length
          ? articulosParams.current
          : ["valor-solo-para-que-no-falle"];
      }

      setTimeout(() => {
        setLoadingDependencias(true);
      }, 800);
    }
  }, [auth, search, refresh, detalleCatalogo]);

  React.useEffect(() => {
    if (loadingDependencias) {
      // const query = Array.isArray(articulosParams.current) ?
      articulosMethod
        .current(articulosParams.current)
        .then((listaDeArticulos: any) => {
          let items: any[] = [...listaDeArticulos];
          if (search) {
            items = listaDeArticulos.filter(({ descripcion }: any) => {
              return [new RegExp(search, "i").test(descripcion)].some((v) => v);
            });
          }

          dispatch(setListaDeArticulos(items));
          dispatch(setLoadingTable(false));
          setLoadingDependencias(false);
        });
    }
  }, [loadingDependencias]);

  // HANDLER MODAL
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;

    if (!idEmpresa) return;

    const fetchData = async () => {
      dispatch(setLoadingTable(true));

      try {
        // Fetch las subcolecciones y los datos relacionados con la sucursal
        const [
          categorias = [],
          marcas = [],
          familias = [],
          catalogos = [],
          sucursales = [],
        ] = await Promise.all([
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "categorias"
          ),
          FireStoreInventario.listarSubCollectionEmpresa(idEmpresa, "marcas"),
          FireStoreInventario.listarSubCollectionEmpresa(idEmpresa, "familias"),
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "catalogos"
          ),
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "sucursales"
          ),
        ]);

        // Dispatch para subcolecciones de la empresa
        dispatch(
          setSubCollectionEmpresa({
            categorias: categorias.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
            })),
            marcas: marcas.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
            })),
            familias: familias.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
            })),
            catalogos: catalogos.map(({ nombreCatalogo, id }: any) => ({
              label: nombreCatalogo,
              value: id,
              id,
            })),
            sucursales: sucursales.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
              id,
            })),
          })
        );
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    fetchData();
  }, [auth, dispatch]);

  const { categorias = [], familias = [], marcas = [] } = subCollectionEmpresa;
  const [originalArticulos, setOriginalArticulos] = useState(listaDeArticulos);

  useEffect(() => {
    if (originalArticulos.length === 0 && listaDeArticulos.length > 0) {
      setOriginalArticulos(listaDeArticulos);
    }
  }, [listaDeArticulos]);

  useEffect(() => {
    const filterArticulos = () => {
      dispatch(setLoadingTable(true));
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

      dispatch(setListaDeArticulos(filteredArticulos));
      dispatch(setLoadingTable(false));
    };

    filterArticulos();
  }, [search, filters, dispatch, originalArticulos]);

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Buscar por Código ó Nombre + ENTER"
            allowClear
            onChange={(e) => setsearch(e.target.value)}
            style={style}
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
        <Modal
          // loading
          title="Filtrar articulos"
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
                  <Select.Option key={categoria.id} value={categoria.value}>
                    {categoria.label}
                  </Select.Option>
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
                  <Select.Option key={familia.value} value={familia.value}>
                    {familia.label}
                  </Select.Option>
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
                  <Select.Option key={marca.value} value={marca.value}>
                    {marca.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Row>
    </Card>
  );
};

export default SearchArticulos;
