"use client";
import React from 'react';
import { Badge, Button, Col, Drawer, Form, Row, Space, Tooltip, Typography } from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setOpenDrawer, setOpenDrawerNomina } from '@/features/recursosHumanosSlice';
import FormContrataciones from '@/components/recursos-humanos/contrataciones/FormContrataciones';
import { useRouter } from 'next/navigation';
import TableColaboradoresNominas from '@/components/recursos-humanos/nominas/TableColaboradoresNominas';
import SearchColaboradoresNominas from '@/components/recursos-humanos/nominas/SearchColaboradoresNominas';
import TableTemporal from '@/components/recursos-humanos/nominas/TableTemporal';


const page = () => {

  const router = useRouter();
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const {
    detalleDeContratacion,
    openDrawerNomina,
    colaboradoresSeleccionados = []
  } = useSelector((state: any) => state.recursosHumanos);

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
                <Tooltip title="Atras">
                  <Button onClick={() => {
                    router.back();
                  }} type="primary" shape="circle" icon={<ArrowLeftOutlined />} />
                </Tooltip>
              </Col>
              <Col>
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Colaboradores para nómina</Typography.Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Badge count={colaboradoresSeleccionados.length}>
              <Button
                type="primary"
                icon={<PlusOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                onClick={() => {
                  dispatch(setOpenDrawerNomina(true));
                }}
                disabled={!Boolean(colaboradoresSeleccionados.length)}
              >
                Registrar nómina
              </Button>
            </Badge>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={/* false ? 'Editar nómina' :  */'Nueva nómina'}
        width={768}
        onClose={() => dispatch(setOpenDrawerNomina(false))}
        open={openDrawerNomina}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: /* false ? "orange" :  */"rgba(5, 5, 5, 0.06)"
          }
        }}>
        <TableTemporal />
      </Drawer>

      <SearchColaboradoresNominas />
      <TableColaboradoresNominas form={form} />
    </div>
  )
}

export default page