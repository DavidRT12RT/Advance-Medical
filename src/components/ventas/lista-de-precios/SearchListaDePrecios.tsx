"use client";
import { Badge, Button, Card, Col, ConfigProvider, DatePicker, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeListaDePrecios, setLoadingTable } from '@/features/ventasSlice';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import '../../../app/finanzas.css';
import esES from "antd/lib/locale/es_ES";

const style: React.CSSProperties = { width: '100%' };

const SearchListaDePrecios = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    refresh,
    listaDeClientes = []
  } = useSelector((state: any) => state.ventas);

  const CLIENTES = listaDeClientes.map((cliente: any) => {
    return { ...cliente, label: cliente?.nombreCliente, value: cliente?.id };
  });

  // HANDLER SELECT
  const [selectedClientes, setSelectedClientes] = React.useState<any[]>([]);
  const onChangeClientes = (value: any) => {
    setSelectedClientes(value);
  };

  // HANDLER SELECT
  const [selectedFechas, setSelectedFechas] = React.useState<any[]>([]);
  const handleRangeChange = (dates: any, dateStrings: any) => {
    if (dates)
      setSelectedFechas(dates);
    else
      setSelectedFechas([]);

  };


  React.useEffect(() => {
    if (auth?.empresa) {
      dispatch(setLoadingTable(true));
      FireStoreVentas.listarListaDePrecios({
        idEmpresa: auth?.empresa?.id || ""
      }).then(async (listaDePrecios) => {

        let items: any[] = [...listaDePrecios];
        if (search) {
          items = listaDePrecios.filter(({ nombreDeLaListaDePrecios, codigoDeLaListaDePrecios }: any) => {
            return [
              new RegExp(search, "i").test(nombreDeLaListaDePrecios),
              new RegExp(search, "i").test(codigoDeLaListaDePrecios?.toString()),
            ].some((v) => v);
          });
        } else if (selectedClientes.length) {
          items = listaDePrecios.filter(({ clientes }: any) => {
            return selectedClientes.some((idCliente: any) => (clientes || []).includes(idCliente));
          });
        } else if (selectedFechas.length) {

          const [fechaInicio, fechaFin] = selectedFechas;

          // Filtrar las fechas dentro del rango
          items = listaDePrecios.filter((ldp: any) => {
            const date = new Date(ldp?.fechaRegistroDoc);
            return date >= fechaInicio.startOf("day").toDate() && date <= fechaFin.endOf("day").toDate();
          });
        }

        dispatch(setListaDeListaDePrecios(items));
        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, selectedClientes, selectedFechas, refresh]);

  // HANDLER MODAL
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
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Input.Search size='large' placeholder="Buscar por Nombre de la lista ó código + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
        <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedClientes.length + (selectedFechas.length ? 1 : 0))}>
          <Button onClick={() => {
            showModal();
          }} size='large' block icon={<FilterOutlined />}>
            Filtrar
          </Button>
          </Badge>
          </div>
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            // loading
            title="Filtrar listas de precios"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}>
            <ConfigProvider locale={esES}>
              <Form
                layout="vertical">
                <Form.Item label={<Typography.Text strong>Clientes</Typography.Text>} colon={false}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={style}
                    placeholder="Seleccione clientes"
                    // defaultValue={[]}
                    onChange={onChangeClientes}
                    options={CLIENTES}
                  />
                </Form.Item>

                <Form.Item label={<Typography.Text strong>Fechas</Typography.Text>} colon={false}>
                  <DatePicker.RangePicker style={style} onChange={handleRangeChange} />
                </Form.Item>
              </Form>
            </ConfigProvider>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchListaDePrecios;
