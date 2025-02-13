"use client";
import { Badge, Button, Card, Col, ConfigProvider, DatePicker, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeClientes, setLoadingTable } from '@/features/ventasSlice';
import FireStoreClientes from '@/firebase/FireStoreVentas';
import '../../../app/finanzas.css';
import esES from 'antd/es/locale/es_ES';
const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchClientes = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    refresh
  } = useSelector((state: any) => state.ventas);

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
      FireStoreClientes.listarClientes({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeClientes) => {

        let items: any[] = [...listaDeClientes];
        if (search) {
          items = listaDeClientes.filter(({ nombreCliente, nombreContacto }: any) => {
            return [
              new RegExp(search, "i").test(nombreCliente),
              new RegExp(search, "i").test(nombreContacto),
            ].some((v) => v);
          });
        } else if (selectedFechas.length) {

          const [fechaInicio, fechaFin] = selectedFechas;

          // Filtrar las fechas dentro del rango
          items = listaDeClientes.filter((cliente: any) => {
            const date = new Date(cliente?.fechaRegistroDoc);
            return date >= fechaInicio.startOf("day").toDate() && date <= fechaFin.endOf("day").toDate();
          });
        }
        dispatch(setListaDeClientes(items));
        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, refresh, selectedFechas]);

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
          <Search size='large' placeholder="Buscar por Nombre del cliente ó Contacto + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedFechas.length ? 1 : 0)}>
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
            title="Filtrar clientes"
            open={isModalOpen}
            onOk={handleOk}
            footer={null}
            onCancel={handleCancel}>
            <ConfigProvider locale={esES}>
              <Form
                layout="vertical">
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

export default SearchClientes;
