"use client";
import { Badge, Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeVentas, setLoadingTable } from '@/features/finanzasSlice';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import '../../../app/finanzas.css';

const ESTADOS = [
  { label: 'En revisión', value: 'En revisión' },
  { label: 'Aceptado', value: 'Aceptado' },
  { label: 'Rechazado', value: 'Rechazado' },
];

const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchVentas = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    refresh
  } = useSelector((state: any) => state.finanzas);

  const {
    listaDeClientes = [],
  } = useSelector((state: any) => state.ventas);

  const CLIENTES = listaDeClientes.map((cliente: any) => {
    return { ...cliente, label: cliente?.nombreCliente, value: cliente?.id };
  });


  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const onChange = (checkedValues: any) => {
    setSelectedStates(checkedValues);
  };

  // HANDLER SELECT
  const [selectedClientes, setSelectedClientes] = React.useState<any[]>([]);
  const onChangeClientes = (value: any) => {
    setSelectedClientes(value);
  };

  /*  const fetchFB = React.useRef(true); */
  React.useEffect(() => {
    if (auth?.empresa/*  && fetchFB.current */) {
      dispatch(setLoadingTable(true));
      FireStoreFinanzas.listarVentas({
        idEmpresa: auth?.empresa?.id || ""
      }).then(async (listaDeVentas) => {

        let items: any[] = [...listaDeVentas];
        if (search && selectedStates.length) {
          items = listaDeVentas.filter(({ id, fechaDeVenta, estatus }: any) => {
            return [
              new RegExp(search, "i").test(id),
              new RegExp(search, "i").test(fechaDeVenta),
              selectedStates.includes(estatus)
            ].some((v) => v);
          });
        } else if (search) {
          items = listaDeVentas.filter(({ id, fechaDeVenta }: any) => {
            return [
              new RegExp(search, "i").test(id),
              new RegExp(search, "i").test(fechaDeVenta)
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeVentas.filter(({ estatus }: any) => {
            return selectedStates.includes(estatus);
          });
        } else if (selectedClientes.length) {
          items = listaDeVentas.filter(({ cliente }: any) => {
            return selectedClientes.includes(cliente);
          });
        }

        dispatch(setListaDeVentas(items));

        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, selectedStates, selectedClientes, refresh]);

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
    // <div>SearchVentas</div>
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search size='large' placeholder="Buscar por Código ó fecha + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedStates.length + selectedClientes.length)}>
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
            title="Filtrar ventas"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Aplicar"
            cancelText="Cerrar"
            footer={null}>

            <Form
              layout="vertical">
              <Form.Item label={<Typography.Text strong>Estatus</Typography.Text>} colon={false}>
                <Checkbox.Group
                  options={ESTADOS}
                  value={selectedStates}
                  onChange={onChange}
                  style={{ display: 'flex', flexDirection: 'column' }} // Disposición vertical
                />
              </Form.Item>

              <Form.Item label={<Typography.Text strong>Cliente</Typography.Text>} colon={false}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Seleccione Clientes"
                  // defaultValue={[]}
                  onChange={onChangeClientes}
                  options={CLIENTES}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchVentas