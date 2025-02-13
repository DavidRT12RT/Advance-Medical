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
  setListaDeUsuarios,
  setCountListaDeUsuarios,
} from "@/features/recursosHumanosSlice";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import {
  setListaDeSucursales,
  setLoadingTable,
} from "@/features/configuracionSlice";

const { Search } = Input;

const style: React.CSSProperties = { width: "100%" };

const ESTADOS = [
  { label: "Activo", value: true },
  { label: "Inactivo", value: false },
];

const TIPOS_SUCURSALES = [
  { label: "Tienda", value: "Tienda" },
  { label: "Oficina", value: "Oficina" },
  { label: "Bodega", value: "Bodega" },
];
interface FiltersState {
  estatusSelected: boolean[];
  tiposSelected: string[];
  encargadosSelected: string[];
}

const SearchSucursales = () => {
  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");
  const [filters, setFilters] = useState<FiltersState>({
    estatusSelected: [],
    tiposSelected: [],
    encargadosSelected: [],
  });

  const countSelectedFilters = () => {
    let count = 0;
    if (filters?.estatusSelected?.length >= 1) count++;
    if (filters?.tiposSelected?.length >= 1) count++;
    if (filters?.encargadosSelected?.length >= 1) count++;
    return count;
  };

  const { refresh, auth } = useSelector((state: any) => state.configuracion);

  const { listaDeSucursales = [] } = useSelector(
    (state: any) => state.configuracion
  );

  const { listaDeUsuarios } = useSelector(
    (state: any) => state.recursosHumanos
  );

  const [originalListaDeSucursales, setOriginalListaDeSucursales] = useState<
    any[]
  >([]);

  useEffect(() => {
    if (!originalListaDeSucursales.length && listaDeSucursales.length) {
      setOriginalListaDeSucursales(listaDeSucursales);
    }
  }, [listaDeSucursales]);

  const fetchFB = React.useRef(true);

  React.useEffect(() => {
    if (auth?.empresa && fetchFB.current) {
      dispatch(setLoadingTable(true));

      FireStoreConfiguracion.listarSucursales({
        idEmpresa: auth?.empresa?.id || "",
      }).then(async (listaDeSucursales) => {
        let items: any[] = [...listaDeSucursales];

        dispatch(setListaDeSucursales(items));

        // Listamos usuarios para poblar encargado
        const listaDeUsuarios = await FireStoreRecursosHumanos.listarUsuarios({
          idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
        });
        dispatch(setListaDeUsuarios(listaDeUsuarios));

        const itemsMap = items.map((sucursal: any) => {
          return {
            ...sucursal,
            populateEncargado: listaDeUsuarios.find((usuario: any) => {
              return usuario?.id == sucursal?.encargado;
            }),
          };
        });

        dispatch(setListaDeSucursales(itemsMap));
        dispatch(setLoadingTable(false));
        fetchFB.current = false;

        setTimeout(() => {
          fetchFB.current = true;
        }, 10);
      });
    }
  }, [auth, refresh]);

  React.useEffect(() => {
    const filterSucursales = () => {
      let filteredSucursales = [...originalListaDeSucursales];

      if (search) {
        filteredSucursales = listaDeSucursales.filter(({ nombre }: any) => {
          return [new RegExp(search, "i").test(nombre)].some((v) => v);
        });
      }

      if (filters.encargadosSelected.length) {
        filteredSucursales = filteredSucursales.filter((s: any) =>
          filters.encargadosSelected.includes(s.encargado)
        );
      }

      if(filters.estatusSelected.length) {
        filteredSucursales = filteredSucursales.filter((s:any) => 
          filters.estatusSelected.includes(s.eliminado)
        );
      }

      if(filters.tiposSelected){
        filteredSucursales = filteredSucursales.filter((s:any) => 
          filters.tiposSelected.includes(s.tipoSucursal)
        );
      }

      dispatch(setListaDeSucursales(filteredSucursales));
    };

    filterSucursales();

  }, [dispatch, filters, originalListaDeSucursales, search]);

  // HANDLER MODAL
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Buscar por Nombre + ENTER"
            allowClear
            onSearch={(value) => {
              setsearch(value);
            }}
            style={style}
          />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
            size="large"
            block
            icon={<FilterOutlined />}
          >
            <Badge count={countSelectedFilters()}>Filtrar</Badge>
          </Button>
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            title="Filtrar sucursales"
            open={isModalOpen}
            onOk={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form layout="vertical">
              <Form.Item label={<Typography.Text>Estatus</Typography.Text>}>
                <Checkbox.Group
                  options={ESTADOS}
                  value={filters.estatusSelected}
                  style={{ display: "flex", flexDirection: "column" }}
                  onChange={(values) =>
                    setFilters({ ...filters, estatusSelected: values })
                  }
                />
              </Form.Item>
              <Form.Item
                label={<Typography.Text>Tipo de bodega</Typography.Text>}
              >
                <Select
                  allowClear
                  value={filters.tiposSelected}
                  onChange={(value) =>
                    setFilters({ ...filters, tiposSelected: value })
                  }
                  style={{ width: "100%" }}
                  placeholder="Selecciona un tipo de sucursal"
                  options={TIPOS_SUCURSALES}
                />
              </Form.Item>
              <Form.Item
                label={<Typography.Text>Encargado(s)</Typography.Text>}
              >
                <Select
                  allowClear
                  value={filters.encargadosSelected}
                  onChange={(value) =>
                    setFilters({ ...filters, encargadosSelected: value })
                  }
                  style={{ width: "100%" }}
                  placeholder="Selecciona los encargados"
                  mode="multiple"
                  options={listaDeUsuarios.map((u: any) => ({
                    label: `${u.nombres} ${u.apellidos}`,
                    value: u.id,
                  }))}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  );
};

export default SearchSucursales;