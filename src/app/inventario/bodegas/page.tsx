"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setDetalleDeSucursal, setOpenDrawer } from '@/features/configuracionSlice';
import FormSucursales from '@/components/inventario/bodegas/FormSucursales';
import SearchSucursales from '@/components/inventario/bodegas/SearchSucursales';
import TableSucursales from '@/components/inventario/bodegas/TableSucursales';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleDeSucursal, openDrawer } = useSelector((state: any) => state.configuracion);

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
                <Title level={4} style={{ marginBottom: '0px' }}>Bodegas</Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
              onClick={() => {
                form.resetFields();

                dispatch(setOpenDrawer(true));
                dispatch(setDetalleDeSucursal(null));

              }}
              disabled={false}
            >
              Nueva bodega
            </Button>
          </Col>
        </Row>
      </Space>
      <Drawer
        title={detalleDeSucursal?.id ? 'Editar bodega' : 'Nueva bodega'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeSucursal?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        <FormSucursales form={form} />
      </Drawer>
      <SearchSucursales />
      <TableSucursales form={form} />
    </div>
  )
}

export default page