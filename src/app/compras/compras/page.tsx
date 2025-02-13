"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux'
import { setDetalleDeCompra, setOpenDrawer } from '@/features/finanzasSlice';
import FormCompras from '@/components/compras/compras/FormCompras';
import SearchCompras from '@/components/compras/compras/SearchCompras';
import TableCompras from '@/components/compras/compras/TableCompras';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { setListaDeProveedores } from '@/features/ventasSlice';

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleDeCompra, openDrawer } = useSelector((state: any) => state.finanzas);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarProveedores({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeProveedores) => {
        dispatch(setListaDeProveedores(listaDeProveedores));
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
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Compras</Typography.Title>
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
                dispatch(setDetalleDeCompra(null));
              }}
              disabled={false}
            >
              Nueva compra
            </Button>
          </Col>
        </Row>
      </Space>
      {/* Drawer es el modal del formulario nuevo Proveedor */}
      <Drawer
        title={detalleDeCompra?.id ? 'Editar compra' : 'Nueva compra'}
        width={968}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeCompra?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        {openDrawer && <FormCompras form={form} />}
      </Drawer>
      <SearchCompras />
      <TableCompras form={form} />
    </div>
  )
}

export default page