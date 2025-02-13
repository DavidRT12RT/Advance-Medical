"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setOpenDrawer, setPerfilUsuario } from '@/features/recursosHumanosSlice';
import FormColaboradores from '@/components/recursos-humanos/colaboradores/FormColaboradores';
import SearchColaboradores from '@/components/recursos-humanos/colaboradores/SearchColaboradores';
import TableColaboradores from '@/components/recursos-humanos/colaboradores/TableColaboradores';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { perfilUsuario, openDrawer } = useSelector((state: any) => state.recursosHumanos);

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
                <Title level={4} style={{ marginBottom: '0px' }}>Colaboradores</Title>
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
                dispatch(setPerfilUsuario(null));
              }}
              disabled={false}
            >
              Nuevo colaborador
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={perfilUsuario?.id ? 'Editar colaborador' : 'Nuevo colaborador'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilUsuario?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        <FormColaboradores form={form} />
      </Drawer>

      <SearchColaboradores />
      <TableColaboradores form={form} />
    </div>
  )
}

export default page