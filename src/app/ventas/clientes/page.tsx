"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  AimOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setOpenDrawer, setPerfilClientes } from '@/features/ventasSlice';
import SearchClientes from '@/components/ventas/clientes/SearchClientes';
import TableClientes from '@/components/ventas/clientes/TableClientes';
import FormClientes from '@/components/ventas/clientes/FormClientes';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { perfilCliente, openDrawer } = useSelector((state: any) => state.ventas);

  /*  React.useEffect(() => {
     const unsubscribe = onAuthStateChanged(getAuth(), async (userImpl) => {
       try {
         console.log('userImpl', userImpl)
         registrarUsuario({name: "test"})
       } catch (error) {
         console.log('error', error)
       }
     });
     return () => {
       unsubscribe();
     };
   }, []); */


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
                <Title level={4} style={{ marginBottom: '0px' }}>Clientes</Title>
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
                dispatch(setPerfilClientes(null));
              }}
              disabled={false}
            >
              Nuevo Cliente
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={perfilCliente?.id ? 'Editar cliente' : 'Nuevo cliente'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilCliente?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        <FormClientes form={form} />
      </Drawer>

      <SearchClientes />
      <TableClientes form={form} />
    </div>
  )
}

export default page