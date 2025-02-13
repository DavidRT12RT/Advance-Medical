"use client";
import React from 'react';
import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setDetalleDeCompra, setDetalleDeRuta, setOpenDrawerRutas, setTotalDeLaCompra } from '@/features/finanzasSlice';

import FormRutas from '@/components/logistica/rutas/FormRutas';
import SearchRutas from '@/components/logistica/rutas/SearchRutas';
import TableRutas from '@/components/logistica/rutas/TableRutas';

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { openDrawerRutas, detalleDeRuta } = useSelector((state: any) => state.finanzas);

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
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Rutas</Typography.Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Button
              color='default'
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                dispatch(setOpenDrawerRutas(true));
                dispatch(setDetalleDeRuta(null));
                dispatch(setTotalDeLaCompra({}));
                dispatch(setDetalleDeCompra(null));
              }}
              disabled={false}
            >
              Nueva ruta
            </Button>
          </Col>
        </Row>
      </Space>
      {/* Drawer es el modal del formulario nueva ruta */}
      <Drawer
        title={detalleDeRuta?.id ? 'Editar ruta' : 'Nueva ruta'}
        width={868}
        onClose={() => dispatch(setOpenDrawerRutas(false))}
        open={openDrawerRutas}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeRuta?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        {openDrawerRutas && <FormRutas form={form} />}
      </Drawer>
      <SearchRutas />
      <TableRutas form={form} />
    </div>
  )
}

export default page;