"use client";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Form,
  message,
} from "antd";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import {
  setListaDeUsuarios,
  setLoadingTable,
} from "@/features/recursosHumanosSlice";
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import { setListaDeSucursales } from "@/features/configuracionSlice";
import { setListaDeUnidades } from "@/features/finanzasSlice";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";

const { Search } = Input;

const style: React.CSSProperties = { width: "100%" };

const SearchChoferes = () => {
  const dispatch = useDispatch();
  const [filtersActives, setFiltersActives] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalUsuarios, setOriginalUsuarios] = useState<any[]>([]);
  const [originalUnidades, setOriginalUnidades] = useState<any[]>([]);
  const [originalSucursales, setOriginalSucursales] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    sucursal: undefined,
    estatus: undefined,
  });
  const [form] = Form.useForm();
  const { auth } = useSelector((state: any) => state.configuracion);

  useEffect(() => {
    if (!auth?.empresa?.id) return;

    dispatch(setLoadingTable(true));
    const listarDatos = async () => {
      try {
        const idEmpresa = !auth?.empresa?.isAdmin ? auth?.empresa?.id : "";

        const [usuarios, sucursales, unidades] = await Promise.all([
          FireStoreRecursosHumanos.listarUsuarios(idEmpresa),
          FireStoreConfiguracion.listarSucursales({ idEmpresa }),
          FireStoreFinanzas.listarUnidadesVehiculares({ idEmpresa }),
        ]);

        setOriginalUsuarios(usuarios);
        dispatch(setListaDeUsuarios(usuarios));
        setOriginalSucursales(sucursales);
        dispatch(setListaDeSucursales(sucursales));
        setOriginalUnidades(unidades);
        dispatch(setListaDeUnidades(unidades));
      } catch (error) {
        console.error("Error al listar sucursales o unidades:", error);
        message.error(
          "No se pudo cargar la Lista de Choferes.Refresque la pagina e intente nuevamente."
        );
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    listarDatos();
  }, []); //auth?.empresa?.isAdmin, auth?.empresa?.id

  //Funcion para manejar la busqueda por nombre y/o por unidad localmente
  const handleSearch = (value: string) => {
    if (!value) {
      dispatch(setListaDeUsuarios(originalUsuarios || []));
      return;
    }

    //Evitan q se produzca un error si alguien intenta buscar mientras los filtros estan activos.
    setFiltersActives(false);
    form.resetFields();

    const lowerCaseValue = value.toLowerCase();

    // Filtrar listaDeUsuarios por nombres.
    const usuariosFiltradosPorNombre = originalUsuarios.filter((usuario: any) =>
      usuario.nombres?.toLowerCase().includes(lowerCaseValue)
    );

    //Filtrar listaDeUnidades por marca.
    const unidadesFiltradasPorMarca = originalUnidades.filter((unidad: any) =>
      unidad.marca?.toLowerCase().includes(lowerCaseValue)
    );

    // Obtengo los Ids de las unidades que coinciden.
    const idsDeUnidadesFiltradas = unidadesFiltradasPorMarca.map(
      (unidad: any) => unidad.id
    );

    // Filtra listaDeUsuarios donde el campo unidadAsignada coincida con los Ids de idsDeUnidadesFiltradas.
    const usuariosFiltradosPorUnidad = originalUsuarios.filter((usuario: any) =>
      idsDeUnidadesFiltradas.includes(usuario.unidadAsignada)
    );

    // Armo un solo array filtrado por nombre y/o por unidad.
    const listaFiltrada = [
      ...usuariosFiltradosPorNombre,
      ...usuariosFiltradosPorUnidad,
    ];

    // Esta parte elimina duplicados.
    const listaSinDuplicados = Array.from(
      new Map(listaFiltrada.map((usuario) => [usuario.id, usuario])).values()
    );

    dispatch(setListaDeUsuarios(listaSinDuplicados));
  };

  //Funcion Abre el Modal de Filtros
  const showModal = () => setIsModalOpen(true);

  //Funcion se encarga de cerrar Modal y manejar los Filtros
  const handleOk = () => {
    setIsModalOpen(false);
    const { estatus, sucursal } = filters;
    let listaFiltrada = originalUsuarios;

    const listaDeSucursalesNombres = originalSucursales.find(
      (sucursalItem: any) => sucursalItem.nombre === sucursal
    );

    if (estatus || sucursal) {
      setFiltersActives(true);
      listaFiltrada = originalUsuarios.filter((usuario: any) => {
        return (
          (!estatus || usuario.estatusActual === estatus) &&
          (!sucursal || usuario.sucursal === listaDeSucursalesNombres?.id)
        );
      });
    }

    dispatch(setListaDeUsuarios(listaFiltrada));
    form.resetFields();
  };

  //Funcion Cierra Modal de Filtros
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  //Funcion para limpiar los Filtros
  const handleClearFilters = () => {
    setFilters({ sucursal: undefined, estatus: undefined });
    setFiltersActives(false);
    dispatch(setListaDeUsuarios(originalUsuarios));
    form.resetFields();
  };

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col xs={24} lg={18}>
          <Search
            size="large"
            placeholder="Buscar por Nombre o Unidad"
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={style}
          />
        </Col>
        <Col xs={24} lg={6}>
          {filtersActives ? (
            <Button
              onClick={handleClearFilters}
              size="large"
              block
              type="dashed"
              icon={<CloseOutlined />}
              style={{
                color: "#ff4d4f",
                borderColor: "#ff4d4f",
              }}
            >
              Eliminar Filtros
            </Button>
          ) : (
            <Button
              onClick={showModal}
              size="large"
              block
              icon={<FilterOutlined />}
            >
              Filtrar
            </Button>
          )}
        </Col>
      </Row>

      <Modal
        title="Filtrar choferes"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Aplicar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Bodega" name="sucursal">
            <Select
              placeholder="Seleccionar bodega"
              allowClear
              onChange={(value) => handleFilterChange("sucursal", value)}
            >
              {Array.from(
                new Set(
                  originalSucursales.map(
                    (sucursal: any) => sucursal.nombre
                  ) as string[]
                )
              ).map((sucursal, index) => (
                <Select.Option key={index} value={sucursal}>
                  {sucursal}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Estatus" name="estatus">
            <Select
              placeholder="Seleccionar estatus"
              allowClear
              onChange={(value) => handleFilterChange("estatus", value)}
            >
              {Array.from(
                new Set(
                  originalUsuarios.map(
                    (usuario: any) => usuario.estatusActual
                  ) as string[]
                )
              ).map((estatusActual, index) => (
                <Select.Option key={index} value={estatusActual}>
                  {estatusActual}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SearchChoferes;
