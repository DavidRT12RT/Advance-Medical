"use client";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterOutlined } from "@ant-design/icons";
import { setListaDeRutas, setLoadingTable } from "@/features/finanzasSlice";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import "../../../app/finanzas.css";
import esES from "antd/lib/locale/es_ES";

const ESTADOS = [
  { label: "Activa", value: true },
  { label: "Inactiva", value: false },
];

const TIPO_DE_RUTA = [
  { label: "Geofence", value: "Geofence" },
  { label: "Clientes", value: "Clientes" },
];

const { Search } = Input;

const style: React.CSSProperties = { width: "100%" };

const SearchRutas = () => {
  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const { auth } = useSelector((state: any) => state.configuracion);

  const { refresh } = useSelector((state: any) => state.finanzas);

  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const onChange = (values: any) => {
    setSelectedStates(values);
  };

  // HANDLER SELECT
  const [selectedTipoDeruta, setSelectedTipoDeruta] = React.useState<any[]>([]);
  const onChangeTipoDeRuta = (value: any) => {
    setSelectedTipoDeruta(value);
  };

  React.useEffect(() => {
    if (auth?.empresa) {
      dispatch(setLoadingTable(true));
      FireStoreFinanzas.listarRutas({
        idEmpresa: auth?.empresa?.id || "",
      }).then(async (listaDeRutas) => {
        let items: any[] = [...listaDeRutas];
        if (search && selectedStates.length) {
          items = listaDeRutas.filter(
            ({ nombreChofer, nombreDeRuta, estatus }: any) => {
              return [
                new RegExp(search, "i").test(nombreChofer),
                new RegExp(search, "i").test(nombreDeRuta),
                selectedStates.includes(estatus),
              ].some((v) => v);
            }
          );
        } else if (search) {
          items = listaDeRutas.filter(({ nombreChofer, nombreDeRuta }: any) => {
            return [
              new RegExp(search, "i").test(nombreChofer),
              new RegExp(search, "i").test(nombreDeRuta),
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeRutas.filter(({ estatus }: any) => {
            return selectedStates.includes(estatus);
          });
        } else if (selectedTipoDeruta.length) {
          items = listaDeRutas.filter(({ tipoDeRuta }: any) => {
            return selectedTipoDeruta.includes(tipoDeRuta);
          });
        }

        dispatch(setListaDeRutas(items));
        dispatch(setLoadingTable(false));
      });
    }
  }, [auth, search, selectedStates, selectedTipoDeruta, refresh]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
    // <div>SearchRutas</div>
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Buscar por Nombre de la ruta ó Chofer + ENTER"
            allowClear
            onSearch={(value) => {
              setsearch(value);
            }}
            style={style}
          />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className="filtrar" style={{ width: "100%" }}>
            <Badge count={selectedStates.length + selectedTipoDeruta.length}>
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
            // loading
            title="Filtrar rutas"
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <Checkbox.Group
                      options={ESTADOS}
                      value={selectedStates}
                      onChange={onChange}
                      style={{ display: "flex", flexDirection: "column" }}
                    />
                  </div>
                </Form.Item>

                <Form.Item
                  label={<Typography.Text strong>Tipo de ruta</Typography.Text>}
                  colon={false}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={style}
                    placeholder="Seleccione tipo de ruta"
                    // defaultValue={[]}
                    onChange={onChangeTipoDeRuta}
                    options={TIPO_DE_RUTA}
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

export default SearchRutas;
