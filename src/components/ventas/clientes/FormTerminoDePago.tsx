import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Button, Col, Divider, Form, Input, Row, Select, Tooltip, Flex, Descriptions } from 'antd';
import { PlusOutlined, DeleteOutlined, UndoOutlined, SaveOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setModalTerminosDePago, setRefresh } from '@/features/ventasSlice';
import FireStoreVentas from '@/firebase/FireStoreVentas';

import { v4 as uuidv4 } from 'uuid';
import { generateRandomString } from '@/helpers/functions';

const FormTerminoDePago = ({ form }: any) => {
  const dispatch = useDispatch();
  const [cuotas, setCuotas] = useState<{ id: string; numeroCuota: string; plazo: string; unidad: string }[]>([]); // Lista de cuotas
  const [tieneCuotas, setTieneCuotas] = useState(false);

  const { loading } = useSelector((state: any) => state.ventas);
  const { auth } = useSelector((state: any) => state.configuracion);

  // Agregar nueva cuota
  const agregarCuota = () => {
    setCuotas([...cuotas, { id: uuidv4(), numeroCuota: '', plazo: '', unidad: 'días' }]);
  };

  // Eliminar cuota
  const eliminarCuota = (id: string) => {
    setCuotas(cuotas.filter(cuota => cuota.id !== id));
  };

  const UNIDADES = [
    { label: 'Días', value: 'días' },
    { label: 'Semanas', value: 'semanas' },
    { label: 'Meses', value: 'meses' },
  ];

  return (
    <Form
      form={form}
      name="create-termino-pago-form"
      layout="vertical"
      style={{ width: "100%" }}
      initialValues={{
        codigoTerminosPago: generateRandomString(),
        diasCredito: '',
        descripcion: '',
        tieneCuotas: 'No',
      }}
      onFinish={async (values) => {

        try {
          dispatch(setLoading(true));

          const [fechaRegistro] = new Date().toISOString().split('T');
          // Registrar el catalogo en Firestore
          await FireStoreVentas.agregarDocumentoEmpresasCollection(
            auth?.empresa?.id,
            uuidv4(),
            { ...values, fechaRegistro },
            "terminos"
          )

          dispatch(setLoading(false));
          dispatch(setModalTerminosDePago(false));
          dispatch(setRefresh(Math.random()));
          form.resetFields();

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Término de pago registrado con éxito!`,
            timer: 3000,
          });

        } catch (error) {
          console.log('error', error);
          Swal.fire({
            title: "ERROR",
            text: error?.toString(),
            icon: "error",
          });
        }
      }}
    >
      <Row gutter={12}>
        <Col xs={24}>
          <Form.Item
            name="codigoTerminosPago"
            label="Código de Términos de Pago"
            rules={[{ required: true, message: 'Ingrese el código del término de pago' }]}
          >
            <Input placeholder="Ingrese el código" type="text" />
          </Form.Item>
        </Col>
      </Row>

      {/* Días de Crédito */}
      <Row gutter={12}>
        <Col xs={24} sm={12} lg={12}>
          <Form.Item
            name="diasCredito"
            label="Días de Crédito"
            rules={[{ required: true, message: 'Ingrese los días de crédito' }]}
          >
            <Input placeholder="Ingrese los días de crédito" type="number" />
          </Form.Item>
        </Col>

        {/* Descripción */}
        <Col xs={24} sm={12} lg={12}>
          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'Ingrese una descripción' }]}
          >
            <Input placeholder="Ingrese una breve descripción" type="text" />
          </Form.Item>
        </Col>
      </Row>

      {/* Tiene Cuotas */}
      <Row gutter={12}>
        <Col xs={24} sm={12} lg={12}>
          <Form.Item
            name="tieneCuotas"
            label="Tiene Cuotas"
            rules={[{ required: true, message: 'Seleccione si permite cuotas' }]}
          >
            <Select
              placeholder="Seleccione"
              options={[
                { label: 'Sí', value: 'Sí' },
                { label: 'No', value: 'No' },
              ]}
              onChange={(value) => setTieneCuotas(value === 'Sí')}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Lista de Cuotas */}
      {tieneCuotas && (
        <>
          <Divider orientation="left">Configuración de Cuotas</Divider>

          {cuotas.map((cuota, index) => (
            <Row key={cuota.id} gutter={12} align="middle">
              {/* Número de Cuota */}
              <Col xs={24} sm={6} lg={6}>
                <Form.Item
                  name={['cuotas', index, 'numeroCuota']}
                  label="Cuota"
                  rules={[{ required: true, message: 'Ingrese el número de cuota' }]}
                >
                  <Input placeholder="Número de cuota" type="number" />
                </Form.Item>
              </Col>

              {/* Plazo de la Cuota */}
              <Col xs={24} sm={8} lg={8}>
                <Form.Item
                  name={['cuotas', index, 'plazo']}
                  label="Plazo"
                  rules={[{ required: true, message: 'Ingrese el plazo de la cuota' }]}
                >
                  <Input placeholder="Plazo de la cuota" type="number" />
                </Form.Item>
              </Col>

              {/* Unidad de Tiempo */}
              <Col xs={24} sm={8} lg={8}>
                <Form.Item
                  name={['cuotas', index, 'unidad']}
                  label="Unidad"
                  rules={[{ required: true, message: 'Seleccione la unidad' }]}
                >
                  <Select options={UNIDADES} placeholder="Unidad" />
                </Form.Item>
              </Col>

              {/* Botón Eliminar */}
              <Col xs={24} sm={2} lg={2}>
                <Tooltip title="Eliminar cuota">
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => eliminarCuota(cuota.id)}
                    danger
                  />
                </Tooltip>
              </Col>
            </Row>
          ))}

          {/* Botón Agregar Cuota */}
          <Row>
            <Col span={24}>
              <Button
                type="dashed"
                onClick={agregarCuota}
                icon={<PlusOutlined />}
                block
              >
                Agregar Cuota
              </Button>
            </Col>
          </Row>
        </>
      )}

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
  );
};

export default FormTerminoDePago;
