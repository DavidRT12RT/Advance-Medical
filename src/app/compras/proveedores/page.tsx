"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux'
import { setOpenDrawer, setPerfilProveedores } from '@/features/ventasSlice';
import FormProveedores from '@/components/compras/proveedores/FormProveedores';
import SearchProveedores from '@/components/compras/proveedores/SearchProveedores';
import TableProveedores from '@/components/compras/proveedores/TableProveedores';
import { setAddressMultiple, setDirecciones } from '@/features/configuracionSlice';
import GoogleAddress from '@/components/GoogleAddress';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { perfilProveedor, openDrawer } = useSelector((state: any) => state.ventas);

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
                <Title level={4} style={{ marginBottom: '0px' }}>Proveedores</Title>
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
                dispatch(setPerfilProveedores(null));

                const idAddress = uuidv4();
                dispatch(setAddressMultiple([]));
                dispatch(setDirecciones([]));
                setTimeout(() => {
                  dispatch(setDirecciones([{ id: idAddress, element: <GoogleAddress id={idAddress} /> }]));
                }, 400);
              }}
              disabled={false}
            >
              Nuevo Proveedor
            </Button>
          </Col>
        </Row>
      </Space>
      {/* Drawer es el modal del formulario nuevo Proveedor */}
      <Drawer
        title={perfilProveedor?.id ? 'Editar proveedor' : 'Nuevo proveedor'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilProveedor?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        <FormProveedores form={form} />
      </Drawer>
      <SearchProveedores />
      <TableProveedores form={form} />
    </div>
  )
}

export default page