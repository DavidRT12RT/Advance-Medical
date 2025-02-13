"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography, Tooltip } from 'antd'
import { useRouter } from 'next/navigation';
import {
  FileTextOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'

import { setOpenDrawerDetalleCatalogo, setOpenDrawerArticulo, setDetalleArticulos, setDetalleCatalogos, setSubCollectionEmpresa, } from '@/features/inventarioSlice';
import { setListaDeProveedores } from '@/features/ventasSlice';
import { setListaDeSucursales } from '@/features/configuracionSlice';
import SearchArticulos from '@/components/inventario/articulos/SearchArticulos';
import TableDetalleCatalogo from '@/components/inventario/catalogos/TableDetalleCatalogo';
import FormDetalleCatalogo from '@/components/inventario/catalogos/FormDetalleCatalogo';
import FireStoreInventario from '@/firebase/FireStoreInventario';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import FormArticulo from '@/components/inventario/articulos/FormArticulos';

const OPTION_SELECT_OTRO = {
  label: "Otro...",
  value: "otro",
};

const PRESENTACIONES_ESTATICAS = [
  { label: 'Caja', value: 'Caja' },
  { label: 'Bolsa', value: 'Bolsa' },
  { label: 'Botella', value: 'Botella' },
  { label: 'Lata', value: 'Lata' },
  { label: 'Saco', value: 'Saco' }
];

const TIPOS_DE_UNIDADES_ESTATICAS = [
  { label: 'Pieza', value: 'Pieza' },
  { label: 'Litro', value: 'Litro' },
  { label: 'Mililitro', value: 'Mililitro' },
  { label: 'Gramo', value: 'Gramo' },
  { label: 'Kilogramo', value: 'Kilogramo' },
  { label: 'Onza', value: 'Onza' },
  { label: 'Libra', value: 'Libra' },
  { label: 'Metro', value: 'Metro' },
  { label: 'Centímetro', value: 'Centímetro' },
  { label: 'Milímetro', value: 'Milímetro' },
  { label: 'Metro cúbico', value: 'Metro cúbico' },
  { label: 'Centímetro cúbico', value: 'Centímetro cúbico' },
  { label: 'Galón', value: 'Galón' },
  { label: 'Barril', value: 'Barril' },
  { label: 'Unidad', value: 'Unidad' },
  { label: 'Paquete', value: 'Paquete' },
  { label: 'Caja', value: 'Caja' },
  { label: 'Saco', value: 'Saco' },
  { label: 'Docena', value: 'Docena' },
  { label: 'Tonelada', value: 'Tonelada' }
];



const page = ({ params }: any) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [formArticulo] = Form.useForm();

  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { detalleArticulo, openDrawerDetalleCatalogo, detalleCatalogo, refreshSubCollection, openDrawerArticulo, refresh } = useSelector((state: any) => state.inventario);

  React.useEffect(() => {

    if (auth?.empresa) {

      Promise.all([
        FireStoreInventario.listarSubCollectionEmpresa(auth?.empresa?.id, "categorias"),
        FireStoreInventario.listarSubCollectionEmpresa(auth?.empresa?.id, "marcas"),
        FireStoreInventario.listarSubCollectionEmpresa(auth?.empresa?.id, "presentaciones"),
        FireStoreInventario.listarSubCollectionEmpresa(auth?.empresa?.id, "familias"),
        FireStoreInventario.listarSubCollectionEmpresa(auth?.empresa?.id, "unidades"),
        FireStoreInventario.listarSubCollectionEmpresa(auth?.empresa?.id, "catalogos")
      ]).then(([
        categorias = [],
        marcas = [],
        presentaciones = [],
        familias = [],
        unidades = [],
        catalogos = []
      ]) => {

        dispatch(setSubCollectionEmpresa({
          categorias: [...categorias.map(({ nombre, id }: any) => ({ label: nombre, value: id })), OPTION_SELECT_OTRO],
          marcas: [...marcas.map(({ nombre, id }: any) => ({ label: nombre, value: id })), OPTION_SELECT_OTRO],
          presentaciones: [...PRESENTACIONES_ESTATICAS, ...presentaciones.map(({ nombre, id }: any) => ({ label: nombre, value: id })), OPTION_SELECT_OTRO],
          familias: [...familias.map(({ nombre, id }: any) => ({ label: nombre, value: id })), OPTION_SELECT_OTRO],
          unidades: [...TIPOS_DE_UNIDADES_ESTATICAS, ...unidades.map(({ nombre, id }: any) => ({ label: nombre, value: id })), OPTION_SELECT_OTRO],
          catalogos: [...catalogos.map(({ nombreCatalogo, id }: any) => ({ label: nombreCatalogo, value: id, id })), OPTION_SELECT_OTRO],
        }));
      });

    }
  }, [auth, refreshSubCollection]);

  React.useEffect(() => {
    if (params?.idCatalogo) {
      FireStoreInventario.buscarCatalogo(auth?.empresa?.id, params?.idCatalogo)
        .then((detalleCatalogo) => {
          dispatch(setDetalleCatalogos(detalleCatalogo));
        });
    }
  }, [params, refresh]);

    // lista de proveedores (colaboradores)
    React.useEffect(() => {
      if (auth) {
        FireStoreVentas.listarProveedores({
          idEmpresa: auth?.empresa?.id || ""
        }).then((listaDeProveedores) => {
          dispatch(setListaDeProveedores(listaDeProveedores));
        });
      }
    }, [auth, refresh]);

    // lista de sucursales (colaboradores)
    React.useEffect(() => {
      if (auth) {
        FireStoreConfiguracion.listarSucursales({
          idEmpresa: auth?.empresa?.id || ""
        }).then((listaDeSucursales) => {
          dispatch(setListaDeSucursales(listaDeSucursales));
        });
      }
    }, [auth, refresh]);
    

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <Tooltip title="Atras">
                  <Button
                    onClick={() => {
                      router.back();
                    }}
                    type="primary"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                  />
                </Tooltip>
              </Col>
              <Col>                
                <FileTextOutlined style={{ fontSize: '24px' }} />
              </Col>
              <Col>
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Articulos ({detalleCatalogo?.nombreCatalogo})</Typography.Title>
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
                dispatch(setOpenDrawerDetalleCatalogo(true));
                form.setFieldsValue({...detalleCatalogo})
              }}
              disabled={false}
            >
              Agregar Artículo
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title='Agregar artículo'
        width={768}
        onClose={() => dispatch(setOpenDrawerDetalleCatalogo(false))}
        open={openDrawerDetalleCatalogo}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormDetalleCatalogo form={form} />
      </Drawer>

      <Drawer
        title={detalleArticulo?.id ? 'Editar artículo' : 'Nuevo artículo'}
        width={768}
        onClose={() => dispatch(setOpenDrawerArticulo(false))}
        open={openDrawerArticulo}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormArticulo form={form} />
      </Drawer>

      <SearchArticulos />
      <TableDetalleCatalogo form={form} />
    </div>
  )
}

export default page