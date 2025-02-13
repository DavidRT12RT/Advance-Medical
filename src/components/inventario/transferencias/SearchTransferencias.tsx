import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FilterOutlined } from "@ant-design/icons";
import { setListaDeTransferencias } from "@/features/inventarioSlice";
import moment from "moment";

const { RangePicker } = DatePicker;

interface FiltersState {
  origenSelected: string[] | null;
  destinoSelected: string[] | null;
  estatusSelected: boolean[]; // true para "Inactivo", false para "Activo"
  fechaRegistroRange: [string, string] | null; // [fecha inicio, fecha fin]
}

const SearchTransferencias = () => {
  const ESTADOS = [
    { label: "Activo", value: false },
    { label: "Inactivo", value: true },
  ];

  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    origenSelected: null,
    destinoSelected: null,
    estatusSelected: [],
    fechaRegistroRange: null,
  });

  // Cuenta la cantidad de filtros seleccionados (para mostrarlos en el Badge)
  const countSelectedFilters = () => {
    let count = 0;
    if (filters.origenSelected) count++;
    if (filters.destinoSelected) count++;
    if (filters.fechaRegistroRange) count++;
    if (filters.estatusSelected.length >= 1) count++;
    return count;
  };

  // Obtenemos del state las listas y datos necesarios
  const {
    listaDeSucursales,
    listaDeUnidadesVehiculares,
    listaDeArticulos,
    listaDeTransferencias = [],
    refreshTransferencias,
  } = useSelector((state: any) => state.inventario);

  // Guardamos una copia original de las transferencias para aplicar los filtros
  const [originalTransferencias, setOriginalTransferencias] = useState(listaDeTransferencias);

  useEffect(() => {
    if (originalTransferencias.length === 0 && listaDeTransferencias.length > 0) {
      setOriginalTransferencias(listaDeTransferencias);
    }
  }, [listaDeTransferencias, refreshTransferencias]);

  useEffect(() => {
    setOriginalTransferencias(listaDeTransferencias);
  }, [refreshTransferencias]);

  useEffect(() => {
    const filterTransferencias = () => {
      let filteredTransferencias = [...originalTransferencias];

      // Filtro por búsqueda:
      // Se verifica si la descripción de la transferencia o la descripción de alguno de sus artículos coincide
      if (search) {
        filteredTransferencias = filteredTransferencias.filter((transferencia: any) => {
          // Verifica si la descripción de la transferencia coincide
          const transferenciaDescMatch =
            transferencia.descripcion &&
            transferencia.descripcion.toLowerCase().includes(search.toLowerCase());

          // Verifica si alguno de los artículos asociados a la transferencia coincide.
          // Se busca el artículo en la lista global de artículos utilizando el id almacenado en "item.articulo".
          const articuloMatch = transferencia.articulos?.some((item: any) => {
            const foundArticulo = listaDeArticulos?.find(
              (a: any) => a.id === item.articulo
            );
            return (
              foundArticulo &&
              foundArticulo.descripcion &&
              foundArticulo.descripcion.toLowerCase().includes(search.toLowerCase())
            );
          });
          return transferenciaDescMatch || articuloMatch;
        });
      }

      // Filtro por estatus
      if (filters.estatusSelected.length) {
        filteredTransferencias = filteredTransferencias.filter(
          (transferencia: any) => filters.estatusSelected.includes(transferencia.eliminado)
        );
      }

      // Filtro por Origen
      if (filters.origenSelected?.length) {
        filteredTransferencias = filteredTransferencias.filter((transferencia: any) => {
          let origenKey = "";
          // Si el id de transferencia.origen se encuentra en la lista de sucursales
          const isSucursal = listaDeSucursales?.some((s: any) => s.id === transferencia.origen);
          if (isSucursal) {
            origenKey = `sucursal-${transferencia.origen}`;
          } else {
            // Si no, se asume que es una unidad vehicular
            const isVehicular = listaDeUnidadesVehiculares?.some(
              (u: any) => u.id === transferencia.origen
            );
            if (isVehicular) {
              origenKey = `vehicular-${transferencia.origen}`;
            }
          }
          return filters.origenSelected!.includes(origenKey);
        });
      }

      // Filtro por Destino
      if (filters.destinoSelected?.length) {
        filteredTransferencias = filteredTransferencias.filter((transferencia: any) => {
          let destinoKey = "";
          const isSucursal = listaDeSucursales?.some((s: any) => s.id === transferencia.destino);
          if (isSucursal) {
            destinoKey = `sucursal-${transferencia.destino}`;
          } else {
            const isVehicular = listaDeUnidadesVehiculares?.some(
              (u: any) => u.id === transferencia.destino
            );
            if (isVehicular) {
              destinoKey = `vehicular-${transferencia.destino}`;
            }
          }
          return filters.destinoSelected!.includes(destinoKey);
        });
      }

      // Filtro por rango de fechas de registro
      if (filters.fechaRegistroRange) {
        const [startDate, endDate] = filters.fechaRegistroRange;
        filteredTransferencias = filteredTransferencias.filter((transferencia: any) => {
          const fechaRegistro = moment(transferencia.fechaRegistro, "YYYY-MM-DD HH:mm:ss");
          return (
            fechaRegistro.isSameOrAfter(moment(startDate, "YYYY-MM-DD")) &&
            fechaRegistro.isSameOrBefore(moment(endDate, "YYYY-MM-DD"))
          );
        });
      }

      // Se despachan las transferencias filtradas
      dispatch(setListaDeTransferencias(filteredTransferencias));
    };

    filterTransferencias();
  }, [
    search,
    filters,
    dispatch,
    originalTransferencias,
    listaDeArticulos,
    listaDeSucursales,
    listaDeUnidadesVehiculares,
  ]);

  const { Search } = Input;

  return (
    <Card style={{ width: "100%", margin: "1rem 0" }}>
      <Row gutter={12} style={{ width: "100%" }}>
        <Col xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Busca por el descripcion de la transferencia o por un artículo dentro de ella"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
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
          title="Filtrar transferencias"
          open={isModalOpen}
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form layout="vertical">
            {/* Filtro por estatus */}
            <Form.Item label={<Typography.Text strong>Estatus</Typography.Text>} colon={false}>
              <Checkbox.Group
                options={ESTADOS}
                value={filters.estatusSelected}
                onChange={(e) => setFilters({ ...filters, estatusSelected: e })}
                style={{ display: "flex", flexDirection: "column" }}
              />
            </Form.Item>

            {/* Filtro por Origen */}
            <Form.Item label={<Typography.Text strong>Origen</Typography.Text>} colon={false}>
              <Select
                mode="multiple"
                allowClear
                value={filters.origenSelected}
                onChange={(e) => setFilters({ ...filters, origenSelected: e })}
                style={{ width: "100%" }}
                placeholder="Seleccione el origen"
              >
                <Select.OptGroup label="Sucursales">
                  {listaDeSucursales?.map((o: any) => (
                    <Select.Option key={`sucursal-${o.id}`} value={`sucursal-${o.id}`}>
                      {o.nombre}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
                <Select.OptGroup label="Unidades Vehiculares">
                  {listaDeUnidadesVehiculares?.map((u: any) => (
                    <Select.Option key={`vehicular-${u.id}`} value={`vehicular-${u.id}`}>
                      {u.marca} {u.modelo}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              </Select>
            </Form.Item>

            {/* Filtro por Destino */}
            <Form.Item label={<Typography.Text strong>Destino</Typography.Text>} colon={false}>
              <Select
                mode="multiple"
                allowClear
                value={filters.destinoSelected}
                onChange={(e) => setFilters({ ...filters, destinoSelected: e })}
                style={{ width: "100%" }}
                placeholder="Seleccione el destino"
              >
                <Select.OptGroup label="Sucursales">
                  {listaDeSucursales?.map((o: any) => (
                    <Select.Option key={`sucursal-${o.id}`} value={`sucursal-${o.id}`}>
                      {o.nombre}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
                <Select.OptGroup label="Unidades Vehiculares">
                  {listaDeUnidadesVehiculares?.map((u: any) => (
                    <Select.Option key={`vehicular-${u.id}`} value={`vehicular-${u.id}`}>
                      {u.marca} {u.modelo}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              </Select>
            </Form.Item>

            {/* Filtro por rango de fecha */}
            <Form.Item label={<Typography.Text strong>Fecha de registro</Typography.Text>} colon={false}>
              <RangePicker
                placeholder={["Fecha de inicio", "Fecha de fin"]}
                format="YYYY-MM-DD"
                onChange={(dates) =>
                  setFilters({
                    ...filters,
                    //@ts-ignore
                    fechaRegistroRange: dates
                      ? [dates[0]?.format("YYYY-MM-DD"), dates[1]?.format("YYYY-MM-DD")]
                      : null,
                  })
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Row>
    </Card>
  );
};

export default SearchTransferencias;
