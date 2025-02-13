"use client";
import React from "react";
import Swal from 'sweetalert2';
import { Button, Col, Divider, Flex, Form, Input, Row, Select, Tooltip } from 'antd';
import { UndoOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setRefresh, setListaTerminosDePago, setOpenDrawerPoliza, setModalTerminosDePago, setDetalleTerminosDePago } from '@/features/ventasSlice';
import FireStoreVentas from "@/firebase/FireStoreVentas";
import FormTerminoDePago from "./FormTerminoDePago";

import { v4 as uuidv4 } from 'uuid';
import Modal from "antd/es/modal/Modal";
import { generateRandomString } from "@/helpers/functions";
const style: React.CSSProperties = { width: '100%' };

const FormPolizaDePago = ({ form }: any) => {
  const dispatch = useDispatch();
  const [formTerminoDePago] = Form.useForm();
  const {
    refresh,
    loading,
    listaTerminosDePago,
    modalTerminosDePago
  } = useSelector((state: any) => state.ventas);

  const { auth } = useSelector((state: any) => state.configuracion);

  const [selectedTerminoPago, setSelectedTerminoPago] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarSubCollectionEmpresa(
        auth?.empresa?.id, "terminos"
      ).then((listaTerminosDePago: any) => {
        dispatch(setListaTerminosDePago(listaTerminosDePago));
      });
    }
  }, [auth, refresh]);

  const TERMINOS_PAGO = listaTerminosDePago.map((termino: any) => {
    return { ...termino, label: `${termino?.codigoTerminosPago} - ${termino?.descripcion}`, value: termino?.id };
  });

  return (
    <>
      <Form
        form={form}
        name="create-policy-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          codigoPoliza: generateRandomString(),
          diasMaxVencimiento: "",
          maxFacturasVencidas: "",
          montoMinVenta: "",
          terminoPago: "",
          limiteCredito: "",
          montoMaxVenta: "",
          estatus: "Activo"
        }}
        onFinish={async (values) => {
          try {
            if (selectedTerminoPago.length === 0) {
              Swal.fire({
                title: "Ingrese un término de pago",
                text: "",
                icon: "warning"
              });
              return;
            }

            const [fechaRegistro] = new Date().toISOString().split('T');
            // Registrar el catalogo en Firestore
            await FireStoreVentas.agregarDocumentoEmpresasCollection(
              auth?.empresa?.id,
              uuidv4(),
              {
                ...values,
                fechaRegistro,
                terminoPago: selectedTerminoPago
              },
              "polizas"
            )

            dispatch(setLoading(false));
            form.resetFields();
            dispatch(setOpenDrawerPoliza(false));
            dispatch(setRefresh(Math.random()));

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Politicas de pago registradas con éxito!`,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error) {

          }
        }}
      >
        <Row gutter={12}>
          <Divider orientation="left">Información de la Póliza</Divider>
          <Col xs={24} sm={24} lg={24}>
            <Form.Item name="codigoPoliza" label="Código de Póliza" rules={[{ required: true, message: 'Ingrese el código de la póliza' }]}>
              <Input maxLength={6} placeholder="Ingrese el código del la póliza" type="text" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="diasMaxVencimiento" label="Días Máximos de Vencimiento">
              <Input placeholder="Ingrese máximo de días de vencimiento" type="number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="maxFacturasVencidas" label="Máximo de Facturas Vencidas">
              <Input placeholder="Ingrese máximo de facturas vencidas" type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="montoMinVenta" label="Monto Mínimo de Venta">
              <Input placeholder="Ingrese monto mínimo de venta" type="number" step="0.01" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="limiteCredito" label="Límite de Crédito" rules={[{ required: true, message: 'Ingrese el límite de crédito' }]}>
              <Input placeholder="Ingrese límite de crédito permitido" type="number" step="0.01" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24}>
            <Form.Item name="terminoPago" label="Término de Pago" rules={[{ required: false, message: 'Seleccione un término de pago' }]}>
              {/* <Select options={TERMINOS_PAGO} placeholder="Seleccione un término de pago" style={style} /> */}
              <Input.Group compact style={{ display: 'flex' }}>
                <Select
                  options={TERMINOS_PAGO}
                  placeholder="Seleccione términos de pago"
                  style={{ flex: 1 }}
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => setSelectedTerminoPago(value)}
                />
                <Tooltip title="Nuevo término de pago">
                  <Button icon={<PlusOutlined />} style={{ flex: '0 0 50px' }} onClick={() => {
                    // Abrir el formulario de registrar articulos
                    formTerminoDePago.resetFields();
                    dispatch(setModalTerminosDePago(true))
                    dispatch(setDetalleTerminosDePago(null));
                  }} />
                </Tooltip>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="montoMaxVenta" label="Monto Máximo de Venta">
              <Input placeholder="Ingrese Monto máximo de venta" type="number" step="0.01" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="estatus" label="Estatus" rules={[{ required: true, message: 'Seleccione el estatus de la póliza' }]}>
              <Select options={[{ label: "Activo", value: "Activo" }, { label: "Inactivo", value: "Inactivo" }]} placeholder="Seleccione el estatus" style={style} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
              <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset">
                Limpiar
              </Button>
              <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit">
                Guardar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Modal
        title={`Nuevo Término de Pago`}
        open={modalTerminosDePago}
        maskClosable={false} // Evita el cierre al hacer clic fuera del modal
        footer={null} // Oculta los botones de "Cancelar" y "OK"
        onCancel={() => dispatch(setModalTerminosDePago(false))}
      >
        <FormTerminoDePago form={formTerminoDePago} />
      </Modal>
    </>
  );
};

export default FormPolizaDePago;
