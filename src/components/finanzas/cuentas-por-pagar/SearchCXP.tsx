"use client";
import { Badge, Button, Card, Checkbox, Col, ConfigProvider, DatePicker, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeCXP, setListaDeVentas, setLoadingTable } from '@/features/finanzasSlice';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import '../../../app/finanzas.css';
import esES from "antd/lib/locale/es_ES";

const ESTADOS = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Pagada', value: 'Pagada' },
];

const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchCXP = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    refresh
  } = useSelector((state: any) => state.finanzas);

  const {
    listaDeProveedores = [],
  } = useSelector((state: any) => state.ventas);

  const PROVEEDORES = listaDeProveedores.map((proveedor: any) => {
    return { ...proveedor, label: proveedor?.nombreProveedor, value: proveedor?.id };
  });


  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const onChange = (checkedValues: any) => {
    setSelectedStates(checkedValues);
  };

  // HANDLER SELECT
  const [selectedProveedor, setSelectedProveedor] = React.useState<any[]>([]);
  const onChangeProveedor = (value: any) => {
    setSelectedProveedor(value);
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
      FireStoreFinanzas.listarCXP({
        idEmpresa: auth?.empresa?.id || ""
      }).then(async (listaDeCXP) => {

        let items: any[] = [...listaDeCXP];
        if (search && selectedStates.length) {
          items = listaDeCXP.filter(({ id, fechaDeVenta, estatus }: any) => {
            return [
              new RegExp(search, "i").test(id),
              new RegExp(search, "i").test(fechaDeVenta),
              selectedStates.includes(estatus)
            ].some((v) => v);
          });
        } else if (search) {
          items = listaDeCXP.filter(({ codigo }: any) => {
            return [
              new RegExp(search, "i").test(codigo),
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeCXP.filter(({ estatus }: any) => {
            return selectedStates.includes(estatus);
          });
        } else if (selectedProveedor.length) {
          items = listaDeCXP.filter(({ proveedor }: any) => {
            return selectedProveedor.includes(proveedor);
          });
        } else if (selectedFechas.length) {

          const [fechaInicio, fechaFin] = selectedFechas;

          // Filtrar las fechas dentro del rango
          items = listaDeCXP.filter((cxp: any) => {
            const date = new Date(cxp?.fechaRegistroDoc);
            return date >= fechaInicio.startOf("day").toDate() && date <= fechaFin.endOf("day").toDate();
          });
        }

        dispatch(setListaDeCXP(items));

        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, selectedStates, selectedProveedor, selectedFechas, refresh]);

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
    // <div>SearchCXP</div>
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search size='large' placeholder="Buscar por Código + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedStates.length + selectedProveedor.length)}>
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
            title="Filtrar cuentas por pagar"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Aplicar"
            cancelText="Cerrar"
            footer={null}>
            <ConfigProvider locale={esES}>
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

                <Form.Item label={<Typography.Text strong>Proveedores</Typography.Text>} colon={false}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={style}
                    placeholder="Seleccione proveedor"
                    // defaultValue={[]}
                    onChange={onChangeProveedor}
                    options={PROVEEDORES}
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

export default SearchCXP