"use client";
import React from 'react';
import { Button, Col, Drawer, Form, Row, Space, Typography, } from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenDrawer, setDetalleDeUnidad, setSubCollectionEmpresa, setListaDeRutas, setOpenDrawerUnidad } from '@/features/finanzasSlice';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import { setListaDeSucursales } from '@/features/configuracionSlice';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setListaDeUsuarios } from '@/features/recursosHumanosSlice';
import SearchUnidades from '@/components/logistica/unidades/SearchUnidades';
import TableUnidades from '@/components/logistica/unidades/TableUnidades';
import FormUnidades from '@/components/logistica/unidades/FormUnidades';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import { setListaDeClientes, setListaDeProveedores } from '@/features/ventasSlice';
import DrawerUnidades from '@/components/logistica/unidades/DrawerUnidades';


const { Title } = Typography;

const page = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { detalleDeUnidad, refreshSubCollection, openDrawerUnidad } = useSelector((state: any) => state.finanzas);

  React.useEffect(() => {
    FireStoreRecursosHumanos.listarUsuarios({
      idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
    }).then((listaDeUsuarios) => {
      dispatch(setListaDeUsuarios(listaDeUsuarios));
    });
  }, []);

  React.useEffect(() => {
    FireStoreFinanzas.listarRutas({
      idEmpresa: auth?.empresa?.id || "",
    }).then((listaDeRutas) => {
      dispatch(setListaDeRutas(listaDeRutas));
    });
  }, []);

  // Lista de proveedores
  React.useEffect(() => {
    FireStoreVentas.listarProveedores({
      idEmpresa: auth?.empresa?.id || "",
    }).then((listaDeProveedores: any) => {
      dispatch(setListaDeProveedores(listaDeProveedores));
    });
  }, []);

  //Lista de clientes para el formulario de rutas por si quiere agregar un nueva ruta
  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth]);

  // Lista de sucursales (bodegas)
  React.useEffect(() => {
    FireStoreConfiguracion.listarSucursales({
      idEmpresa: auth?.empresa?.id || "",
    }).then((listaDeSucursales: any) => {
      dispatch(setListaDeSucursales(listaDeSucursales));
    });
  }, []);

  React.useEffect(() => {
    FireStoreRecursosHumanos.listarUsuarios({
      idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
    }).then((listaDeUsuarios) => {
      dispatch(setListaDeUsuarios(listaDeUsuarios));
    });
  }, []);


  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4} style={{ margin: 0 }}>Lista de Unidades</Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={() => {
                    form.resetFields();
                    dispatch(setDetalleDeUnidad(null));
                    dispatch(setOpenDrawerUnidad(true));
                  }}
                  icon={<PlusOutlined />}
                >
                  Nueva Unidad
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Space>
      <DrawerUnidades />
      <SearchUnidades />
      <TableUnidades form={form} />
    </div>
  );
};

export default page;
