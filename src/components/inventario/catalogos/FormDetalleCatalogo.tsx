"use client";
import React, { useState } from "react";
import Swal from 'sweetalert2';
import { Badge, Button, Col, Divider, Flex, Form, Grid, Input, message, Row, Select, Modal, Tooltip, List, Progress, Typography, Drawer } from 'antd';
import { UndoOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { setArticuloTemporal, setDetalleArticulos, setListaDeArticulos, setLoading, setModalInformacionDelArticulo, setOpenDrawer, setOpenDrawerArticulo, setRefresh,setListaCatalogoDetalleArticulo, setOpenDrawerDetalleCatalogo } from '@/features/inventarioSlice';
import FireStoreInventario from '@/firebase/FireStoreInventario';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { setListaDeClientes } from "@/features/ventasSlice";
import FormInformacionDelArticulo from "../articulos/FormInformacionDelArticulo";
import { green } from '@ant-design/colors';
import FormArticulos from "../articulos/FormArticulos";
import { generateRandomString } from "@/helpers/functions";

const style: React.CSSProperties = { width: '100%' };

const FormCatalogo = ({ form }: any) => {

  const dispatch = useDispatch();

  const [formArticulos] = Form.useForm();
  const [formInformacionDelArticulo] = Form.useForm();
  console.log("Formulario detalle Catalogo: ", form.getFieldsValue())


  const {
    refresh,
    loading,
    listaCatalogoDetalleArticulo = [],
    articuloTemporal,
    modalInformacionDelArticulo,
    openDrawerArticulo,
    detalleCatalogo
  } = useSelector((state: any) => state.inventario);

  const { listaDeClientes } = useSelector((state: any) => state.ventas);

  const { auth } = useSelector((state: any) => state.configuracion);
  const [selectedArticulos, setSelectedArticulos] = useState<any[]>([]);

  const ARTICULOS = listaCatalogoDetalleArticulo.map((articulo: any) => {
    return { ...articulo, label: `${articulo?.codigoArticulo} - ${articulo?.descripcion}`, value: articulo?.id };
  });

  React.useEffect(() => {
    if (articuloTemporal && articuloTemporal?.informacionDelArticulo) {
      // articuloTemporal?.informacionDelArticulo
      // la informacion del form de informacion del articulo se asocio al articulo temporal
      setSelectedArticulos((oldData: any) => ([...oldData, articuloTemporal]));
      dispatch(setArticuloTemporal(null));

    }
  }, [articuloTemporal]);


  React.useEffect(() => {
    FireStoreInventario.listarArticulos({
      idEmpresa: auth?.empresa?.id || ""
    }).then((listaDeArticulos) => {
      dispatch(setListaCatalogoDetalleArticulo(listaDeArticulos));
    });
  }, [auth, refresh]);

  React.useEffect(() => {
    if (auth) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth]);

  const CLIENTES = listaDeClientes.map((cliente: any) => {
    return { ...cliente, label: cliente?.nombreCliente, value: cliente?.id };
  });

  const handleArticuloSelect = (value: string) => {

    const findArticulo = listaCatalogoDetalleArticulo.find((articulo: any) => (articulo?.id == value));
    if (findArticulo) {
      dispatch(setArticuloTemporal(findArticulo));
      dispatch(setModalInformacionDelArticulo(true));
    }

  };

  return (
    <>
      <Form
        form={form}
        name="create-catalog-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          nombreCatalogo: detalleCatalogo?.nombreCatalogo || "",
          articulos: "",
          cliente: ""
        }}
        onFinish={async (values) => {
          try {
            dispatch(setLoading(true));
            const { articulos, ...others } = values;

            if(articulos.length > 0) {
              articulos.push(...selectedArticulos)
            }

            console.log('articulos: ', articulos);
            console.log('selectedArticulos: ', selectedArticulos);

            const [fechaRegistro] = new Date().toISOString().split('T');
            // Registrar el catalogo en Firestore
            await FireStoreInventario.registrarCatalogo(auth?.empresa?.id, {
              id: others?.id || "",
              nombreCatalogo: others?.nombreCatalogo || "",
              articulos: articulos || selectedArticulos,
              cliente: others?.cliente
            });


            setSelectedArticulos([]);
            dispatch(setLoading(false));
            form.resetFields();
            dispatch(setOpenDrawerDetalleCatalogo(false));
            dispatch(setRefresh(Math.random()));
            form.resetFields();

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Catálogo ${false ? 'actualizado' : 'registrado'} con éxito!`,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error: any) {
            console.log('error', error);
            dispatch(setLoading(false));
            Swal.fire({
              title: "ERROR",
              text: error?.toString(),
              icon: "error",
            });
          }
        }}
      >
        <Row gutter={12}>
          <Divider orientation="left">Información del catálogo</Divider>

          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: 'Ingrese Id' }]}
          >
            <Input placeholder="Ingrese Id" style={style} />
          </Form.Item>

          {/* Campo para el nombre del catálogo */}
          <Col xs={24} sm={10} lg={12} xl={12}>
            <Form.Item name="nombreCatalogo" label="Nombre del Catálogo" rules={[{ required: true, message: "Ingrese el nombre del catálogo" }]}>
              <Input placeholder="Ingrese el nombre del catálogo" style={style} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10} lg={12} xl={12} >
            <Form.Item name="cliente" label="Cliente" rules={[{ required: false, message: 'Seleccione un cliente' }]}>
              <Select options={CLIENTES} placeholder="Seleccione un cliente" style={style} />
            </Form.Item>
          </Col>

          {/* Campo de selección de artículo */}
          <Col xs={24} sm={14} lg={18} xl={18}>
            <Form.Item name="articulos" label="Artículos" rules={[{ required: false, message: 'Seleccione artículos' }]}>
              <Input.Group compact style={{ display: 'flex' }}>
                <Select
                  options={ARTICULOS}
                  placeholder="Seleccione artículos"
                  style={{ flex: 1 }}
                  showSearch
                  optionFilterProp="label"
                  onChange={handleArticuloSelect}
                />
                <Tooltip title="Nuevo artículo">
                  <Button icon={<PlusOutlined />} style={{ flex: '0 0 50px' }} onClick={() => {
                    // Abrir el formulario de registrar articulos
                    formArticulos.resetFields();
                    dispatch(setOpenDrawerArticulo(true))
                    // dispatch(setDetalleArticulos(null));
                  }} />
                </Tooltip>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} lg={24} xl={24}>
            {Boolean((selectedArticulos || []).length) && (
              <List
                size="small"
                header={(
                  <Badge offset={[15, 12]} count={(selectedArticulos || []).length}>
                    <Typography.Text strong>
                      Lista de artículos
                    </Typography.Text>
                  </Badge>
                )}
                footer={null}
                bordered
                dataSource={(selectedArticulos || [])}
                renderItem={(item) => <List.Item
                  actions={[
                    <Tooltip title="Eliminar">
                      <Button type="dashed" shape="circle" danger icon={<MinusCircleOutlined />} onClick={async () => {
                        const result = await Swal.fire({
                          title: "Seguro de eliminar articulo?",
                          text: `La información del artículo "${item?.descripcion}" se perdera`,
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#1677ff",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Si",
                          cancelButtonText: "No"
                        });

                        if (result.isConfirmed) {

                        }
                      }} />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    title={`${item?.codigoArticulo} - ${item?.descripcion}`}
                  /* description={(
                    <Progress percent={item?.informacion ? 100 : 0} size="small" />
                  )} */
                  />
                  <Progress percent={100} steps={5} size="small" strokeColor={green[6]} />
                </List.Item>}
              />
            )}
          </Col>
        </Row>

        {/* Botones de acción */}
        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
              <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset"> Limpiar </Button>
              <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit"> Guardar </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Drawer
        title={'Nuevo artículo'}
        width={768}
        onClose={() => dispatch(setOpenDrawerArticulo(false))}
        open={openDrawerArticulo}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormArticulos form={formArticulos} />
      </Drawer>

      <Modal
        title={`Detalles del artículo`}
        open={modalInformacionDelArticulo}
        maskClosable={false} // Evita el cierre al hacer clic fuera del modal
        footer={null} // Oculta los botones de "Cancelar" y "OK"
        onCancel={() => dispatch(setModalInformacionDelArticulo(false))}
      >
        <FormInformacionDelArticulo form={formInformacionDelArticulo} />
      </Modal>
    </>
  );
};

export default FormCatalogo;
