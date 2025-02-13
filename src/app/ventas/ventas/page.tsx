"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux'
import { setDetalleDeVenta, setOpenDrawer } from '@/features/finanzasSlice';
import FormVentas from '@/components/ventas/ventas/FormVentas';
import SearchVentas from '@/components/ventas/ventas/SearchVentas';
import TableVentas from '@/components/ventas/ventas/TableVentas';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { setListaDeClientes } from '@/features/ventasSlice';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleDeVenta, openDrawer } = useSelector((state: any) => state.finanzas);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    if (auth) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth]);


  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <FileTextOutlined style={{ fontSize: '24px' }} />
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: '0px' }}>Ventas</Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              /* style={{ background: "orange" }} */
              icon={<PlusOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
              onClick={() => {
                form.resetFields();
                dispatch(setOpenDrawer(true));
                dispatch(setDetalleDeVenta(null));
              }}
              disabled={false}
            >
              Nueva pre-venta
            </Button>
          </Col>
        </Row>
      </Space>
      {/* Drawer es el modal del formulario nuevo Proveedor */}
      <Drawer
        title={detalleDeVenta?.id ? 'Editar pre-venta' : 'Nueva pre-venta'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeVenta?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        {openDrawer && <FormVentas form={form} />}
      </Drawer>

      <SearchVentas />
      <TableVentas form={form} />
    </div>
  )
}

export default page