"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  AimOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setDetalleDeContratacion, setOpenDrawer, setPerfilUsuario } from '@/features/recursosHumanosSlice';
import FormContrataciones from '@/components/recursos-humanos/contrataciones/FormContrataciones';
import SearchContrataciones from '@/components/recursos-humanos/contrataciones/SearchContrataciones';
import TableContrataciones from '@/components/recursos-humanos/contrataciones/TableContrataciones';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleDeContratacion, openDrawer } = useSelector((state: any) => state.recursosHumanos);

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
                <Title level={4} style={{ marginBottom: '0px' }}>Contrataciones</Title>
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
                dispatch(setDetalleDeContratacion(null));
              }}
              disabled={false}
            >
              Nueva contratación
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={detalleDeContratacion?.id ? 'Editar contratación' : 'Nueva contratación'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeContratacion?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        <FormContrataciones form={form} />
      </Drawer>

      <SearchContrataciones />
      <TableContrataciones form={form} />
    </div>
  )
}

export default page