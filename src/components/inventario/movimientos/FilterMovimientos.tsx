"use client";
import { useEffect, useState } from "react";
import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Row,
  Col,
  Button,
  DatePicker,
  Select,
  Card,
  Form,
  Input,
  message,
} from "antd";
import {
  setListaDeMovimientos,
  setLoadingTable,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

type Movimiento = {
  documentId: string;
  destino: string;
  eliminado: boolean;
  fecha: string;
  hora: string;
  idCompra?: string | null;
  idTransferencia?: string | null;
  idVenta?: string | null;
  noArtInvolucrados: number;
  nombreDestino?: string;
  nombreOrigen?: string;
  nombreUsuarioResponsable: string;
  origen?: string;
  tipoMovimiento: string;
  usuarioResponsable: string;
};

const FilterMovimientos = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtersActives, setFiltersActives] = useState(false);
  const [originalMovimientos, setOriginalMovimientos] = useState<Movimiento[]>(
    []
  );
  const dispatch = useDispatch();
  const { listaDeMovimientos = [] } = useSelector(
    (state: any) => state.inventario
  );
  const { auth } = useSelector((state: any) => state.configuracion);

  const fetchMovimientos = async () => {
    if (!auth?.empresa?.id) return;

    dispatch(setLoadingTable(true));
    (async () => {
      try {
        const idEmpresa = auth?.empresa?.id;
        const movimientos: any = await FireStoreInventario.listarMovimientos(
          idEmpresa
        );
        setOriginalMovimientos(movimientos);
        dispatch(setListaDeMovimientos(movimientos));
      } catch (error) {
        console.error("Error al listar movimientos:", error);
        message.error(
          "No se pudo cargar la Lista de Movimientos.Refresque la pagina e intente nuevamente."
        );
      } finally {
        dispatch(setLoadingTable(false));
      }
    })();
  };

  useEffect(() => {
    fetchMovimientos();
  }, []); //auth?.empresa?.id

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSearch = (value: string) => {
    if (!value) {
      dispatch(setListaDeMovimientos(originalMovimientos));
      return;
    }
    setFiltersActives(false);
    form.resetFields();

    const lowerCaseValue = value.toLowerCase();

    const movFiltradosPorTipoDeMov = originalMovimientos.filter(
      (movimiento: Movimiento) =>
        movimiento.tipoMovimiento.toLowerCase().includes(lowerCaseValue)
    );

    dispatch(setListaDeMovimientos(movFiltradosPorTipoDeMov));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { dateRange, tipoMovimiento, origenDestino, usuarioResponsable } =
        values;

      let filteredData = listaDeMovimientos;

      if (dateRange || tipoMovimiento || origenDestino || usuarioResponsable) {
        setFiltersActives(true);
        filteredData = listaDeMovimientos.filter((movimiento: Movimiento) => {
          const movimientoFecha = new Date(movimiento.fecha).setHours(
            0,
            0,
            0,
            0
          );

          const startDate = dateRange
            ? new Date(dateRange[0].format("YYYY-MM-DD")).setHours(0, 0, 0, 0)
            : null;
          const endDate = dateRange
            ? new Date(dateRange[1].format("YYYY-MM-DD")).setHours(
                23,
                59,
                59,
                999
              )
            : null;

          const matchDate =
            !dateRange ||
            (startDate &&
              endDate &&
              movimientoFecha >= startDate &&
              movimientoFecha <= endDate);

          const matchTipoMovimiento =
            !tipoMovimiento || movimiento.tipoMovimiento === tipoMovimiento;
          const matchOrigenDestino =
            !origenDestino ||
            movimiento.nombreOrigen === origenDestino ||
            movimiento.nombreDestino === origenDestino;
          const matchUsuarioResponsable =
            !usuarioResponsable ||
            movimiento.nombreUsuarioResponsable === usuarioResponsable;

          return (
            matchDate &&
            matchTipoMovimiento &&
            matchOrigenDestino &&
            matchUsuarioResponsable
          );
        });
      }

      dispatch(setListaDeMovimientos(filteredData));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al validar los campos:", error);
    }
  };

  const handleClearFilters = async () => {
    form.resetFields();
    setFiltersActives(false);

    dispatch(setListaDeMovimientos(originalMovimientos));
  };

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} justify="end" style={{ width: "100%" }}>
        <Col xs={24} lg={18}>
          <Search
            size="large"
            placeholder="Buscar por Tipo de Movimiento"
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "100%" }}
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
              Filtrar Movimientos
            </Button>
          )}
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            title="Filtrar Movimientos"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Aplicar"
            cancelText="Cancelar"
          >
            <Form layout="vertical" style={{ width: "100%" }} form={form}>
              {/* Filtro por rango de fechas */}
              <Col span={24}>
                <Form.Item label="Rango de Fechas:" name="dateRange">
                  <RangePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              {/* Filtro por tipo de movimiento */}
              <Col span={24}>
                <Form.Item label="Tipo de Movimiento:" name="tipoMovimiento">
                  <Select
                    placeholder="Seleccione tipo"
                    style={{ width: "100%" }}
                  >
                    <Option value="Entrada">Entrada</Option>
                    <Option value="Salida">Salida</Option>
                    <Option value="Ajuste">Ajuste</Option>
                    <Option value="Transferencia">Transferencia</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Filtro por origen/destino */}
              <Col span={24}>
                <Form.Item label="Origen/Destino:" name="origenDestino">
                  <Select
                    placeholder="Seleccione origen/destino"
                    style={{ width: "100%" }}
                  >
                    <Option value="Compra">Compra</Option>
                    <Option value="Venta">Venta</Option>
                    <Option value="Sucursal">Sucursal</Option>
                    <Option value="Unidad">Unidad</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Filtro por usuario responsable */}
              <Col span={24}>
                <Form.Item
                  label="Usuario Responsable:"
                  name="usuarioResponsable"
                >
                  <Select
                    placeholder="Seleccione usuario"
                    style={{ width: "100%" }}
                  >
                    {Array.from(
                      new Set(
                        listaDeMovimientos.map(
                          (movimiento: any) =>
                            movimiento.nombreUsuarioResponsable
                        ) as string[]
                      )
                    ).map((nombreUsuarioResponsable, index) => (
                      <Select.Option
                        // key={index}
                        value={nombreUsuarioResponsable}
                      >
                        {nombreUsuarioResponsable}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  );
};

export default FilterMovimientos;
