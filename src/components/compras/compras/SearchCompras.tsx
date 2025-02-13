"use client";
import { Badge, Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeCompras, setLoadingTable } from '@/features/finanzasSlice';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import { CompraStatus } from '../../../types/compras';
import '../../../app/finanzas.css';

const ESTADOS = [
  { label: CompraStatus.Pendiente, value: CompraStatus.Pendiente },
  { label: CompraStatus.PendienteInformacion, value: CompraStatus.PendienteInformacion },
  { label: CompraStatus.Transito, value: CompraStatus.Transito },
  { label: CompraStatus.Rechazado, value: CompraStatus.Rechazado },
];

const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchSucursales = () => {

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
  const [selectedProveedores, setSelectedProveedores] = React.useState<any[]>([]);
  const onChangeProveedores = (value: any) => {
    setSelectedProveedores(value);
  };

  /*  const fetchFB = React.useRef(true); */
  React.useEffect(() => {
    if (auth?.empresa/*  && fetchFB.current */) {
      dispatch(setLoadingTable(true));
      FireStoreFinanzas.listarCompras({
        idEmpresa: auth?.empresa?.id || ""
      }).then(async (listaDeCompras) => {

        let items: any[] = [...listaDeCompras];
        if (search && selectedStates.length) {
          items = listaDeCompras.filter(({ codigoCompra, fechaDeCompra, estatus }: any) => {
            return [
              new RegExp(search, "i").test(codigoCompra),
              new RegExp(search, "i").test(fechaDeCompra),
              selectedStates.includes(estatus)
            ].some((v) => v);
          });
        } else if (search) {
          items = listaDeCompras.filter(({ codigoCompra, fechaDeCompra }: any) => {
            return [
              new RegExp(search, "i").test(codigoCompra),
              new RegExp(search, "i").test(fechaDeCompra)
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeCompras.filter(({ estatus }: any) => {
            return selectedStates.includes(estatus);
          });
        } else if (selectedProveedores.length) {
          items = listaDeCompras.filter(({ articulos }: any) => {
            return selectedProveedores.some((proveedor: any) => {
              return articulos.some((articulo: any) => {
                return articulo.proveedor === proveedor;
              });
            });
          });
        }

        dispatch(setListaDeCompras(items));

        dispatch(setLoadingTable(false));
        /* fetchFB.current = false;

        setTimeout(() => {
          fetchFB.current = true;
        }, 10); */
      });
    }
  }, [auth, search, selectedStates, selectedProveedores, refresh]);

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
          <Search size='large' placeholder="Buscar por Código ó fecha + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedStates.length + selectedProveedores.length)}>
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
            title="Filtrar compras"
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

              <Form.Item label={<Typography.Text strong>Proveedor</Typography.Text>} colon={false}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Seleccione Proveedores"
                  // defaultValue={[]}
                  onChange={onChangeProveedores}
                  options={PROVEEDORES}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchSucursales;
