"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setOpenDrawerArticulo, setDetalleArticulos, setDetalleCatalogos, setSubCollectionEmpresa } from '@/features/inventarioSlice';
import SearchArticulos from '@/components/inventario/articulos/SearchArticulos';
import TableArticulos from '@/components/inventario/articulos/TableArticulos';
import FormArticulos from '@/components/inventario/articulos/FormArticulos';

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleArticulo, openDrawerArticulo } = useSelector((state: any) => state.inventario);

  React.useEffect(() => {
    dispatch(setDetalleCatalogos(null));
  }, []);

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
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Articulos</Typography.Title>
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
                dispatch(setOpenDrawerArticulo(true));
                dispatch(setDetalleArticulos(null));
              }}
              disabled={false}
            >
              Nuevo Artículo
            </Button>
          </Col>
        </Row>
      </Space>
      <Drawer
        title={detalleArticulo?.id ? 'Editar artículo' : 'Nuevo artículo'}
        width={768}
        onClose={() => dispatch(setOpenDrawerArticulo(false))}
        open={openDrawerArticulo}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleArticulo?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        <FormArticulos form={form} />
      </Drawer>
      <SearchArticulos />
      <TableArticulos form={form} />
    </div>
  )
}

export default page;