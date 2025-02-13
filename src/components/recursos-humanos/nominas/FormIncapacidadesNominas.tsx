"use client";
import { Button, Col, DatePicker, Divider, Flex, Form, Input, Row, Select, Switch, TimePicker, Tooltip } from 'antd';
import * as React from 'react'
import Swal from 'sweetalert2';
import {
  UndoOutlined,
  SaveOutlined,
  SmileOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setLoading, setNewSucursalId, setOpenDrawer, setRefresh } from '@/features/configuracionSlice';
import { setColaboradoresSeleccionados, setIsNewIncapacidadNominaId, setListaDeUsuarios, setOpenDrawerSucursal, setOpenModalIncapacidades } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { onAuthStateChanged } from 'firebase/auth';
dayjs.extend(customParseFormat);

const style: React.CSSProperties = { width: '100%' };

const TIPO_DE_SUCURSAL = [
  { label: 'Tienda', value: 'Tienda' },
  { label: 'Oficina', value: 'Oficina' },
  { label: 'Bodega', value: 'Bodega' },
  { label: 'Centro de Distribución', value: 'Centro de Distribución' }
];

const METODO_DE_CALCULO = [
  { label: 'Con Salario Base', value: 'conSalarioBase' },
  { label: 'Cantidad Fija', value: 'cantidadFija' },
];

const TIPO_DE_OPERACION = [
  { label: 'Suma', value: 'suma' },
  { label: 'Resta', value: 'resta' },
];

const OPCIONES_DE_INCIDENCIA = [
  { label: 'Accidente Trabajo', value: 'accidenteTrabajo' },
  { label: 'Accidente Trayecto', value: 'accidenteTrayecto' },
  { label: 'Accidente General', value: 'accidenteGeneral' },
  { label: 'Accidente Fuera de Trabajo', value: 'accidenteFueraDeTrabajo' },
  { label: 'Pagada por Empresa', value: 'pagadaPorEmpresa' },
  { label: 'Licencia 140 VIS', value: 'licencia140VIS' },
  { label: 'Incapacidad por Maternidad', value: 'incapacidadPorMaternidad' },
];

const OPCIONES_RAMO_DE_SEGURO = [
  { label: 'Riesgo de Trabajo', value: 'riesgoDeTrabajo' },
  { label: 'Enfermedad General', value: 'enfermedadGeneral' },
  { label: 'Maternidad Prenatal', value: 'maternidadPrenatal' },
  { label: 'Maternidad de Enlace', value: 'maternidadDeEnlace' },
  { label: 'Maternidad de Postnatal', value: 'maternidadDePostnatal' },
  { label: 'Licencia 140 VISS', value: 'licencia140VISS' },
];


const OPCIONES_TIPO_DE_RIESGO = [
  { label: 'Por Accidente', value: 'porAccidente' },
  { label: 'Por Enfermedad', value: 'porEnfermedad' },
];

const OPCIONES_SECUELA_O_CONSECUENCIA = [
  { label: 'Ninguna', value: 'ninguna' },
  { label: 'Incapacidad Temporal', value: 'incapacidadTemporal' },
  { label: 'Valuación Inicial Provisional', value: 'valuacionInicialProvisional' },
  { label: 'Valuación Inicial Definitiva', value: 'valuacionInicialDefinitiva' },
  { label: 'Defunción', value: 'defuncion' },
  { label: 'Recaída', value: 'recaida' },
  { label: 'Valuación Post a la Fecha de Alta', value: 'valuacionPostFechaAlta' },
  { label: 'Revaluación Provisional', value: 'revaluacionProvisional' },
  { label: 'Recaída sin Alta Médica', value: 'recaidaSinAltaMedica' },
  { label: 'Revaluación Definitiva', value: 'revaluacionDefinitiva' },
];

const OPCIONES_CONTROL_DE_INCAPACIDAD = [
  { label: 'Ninguna', value: 'ninguna' },
  { label: 'Única', value: 'unica' },
  { label: 'Inicial', value: 'inicial' },
  { label: 'Subsecuente', value: 'subsecuente' },
  { label: 'Alta Médica o ST-2', value: 'altaMedicaOST2' },
  { label: 'Valuación ST-3', value: 'valuacionST3' },
  { label: 'Defunción o ST-3', value: 'defuncionOST3' },
  { label: 'Prenatal', value: 'prenatal' },
  { label: 'Enlace', value: 'enlace' },
  { label: 'Postnatal', value: 'postnatal' },
];





const FormIncapacidadesNominas = ({ form }: any) => {

  const dispatch = useDispatch();

  const {
    loading,
    detalleDeSucursal,
    // google maps
    coordinates,
    address,
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    colaboradoresSeleccionados,
    listaDeUsuarios,
  } = useSelector((state: any) => state.recursosHumanos);

  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      /* labelCol={{ span: 10 }}
      wrapperCol={{ span: 14 }} */
      labelAlign="left"
      autoComplete="off"
      style={{ width: "100%" }}
      initialValues={{
        id: "",
        folio: "",// text
        tipoDeIncidencia: "",// select vacio
        diasAutorizados: "",// number min 0
        fechaDeInicio: dayjs(),// date now
        ramoDeSeguro: "",// select vacio
        tipoDeRiesgo: "",// select vacio
        porcentajeDeIncapacidad: "",// number min 0
        cantidadAPagar: "",// number min 0
        imss: false,// checkbox
        secuelaOConsecuencia: "",// select vacio
        controlDeIncapacidad: "",// select vacio
        descripcion: "",// text
        ubicacion: "",// text
      }}
      onFinish={async (values) => {
        console.log('values', values);
        try {
          if (!address || !coordinates?.lat || !coordinates?.lng) {
            Swal.fire({
              title: "Ingrese una dirección",
              text: "",
              icon: "warning"
            });
            return;
          }

          dispatch(setLoading(true));
          // REGISTRAMOS EL USUARIO EN FIRESTORE
          const newIncapacidadId = await FireStoreRecursosHumanos.registrarIncapacidadesNominas(auth?.empresa?.id, {
            ...values,
            fechaDeInicio: values?.fechaDeInicio.format('YYYY-MM-DD'),
            ubicacion: address,
            coordinates
          });
          dispatch(setLoading(false));

          form.resetFields();
          dispatch(setOpenModalIncapacidades(false));
          dispatch(setIsNewIncapacidadNominaId(newIncapacidadId));
          // dispatch(setRefresh(Math.random()));

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Incapacidad ${false ? 'actualizada' : 'registrada'} con éxito!`,
            showConfirmButton: false,
            timer: 3000
          });
        } catch (error: any) {
          dispatch(setLoading(false));
          console.log('error', error);
          Swal.fire({
            title: "ERROR",
            text: error?.toString(),
            icon: "error"
          });
        }
      }}
    >

      <Row gutter={12} style={{ marginTop: "1rem" }}>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          {/* start input hidden */}
          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: 'Ingrese Id' }]}
          >
            <Input placeholder="Ingrese Id" style={style} />
          </Form.Item>
          {/* end input hidden */}
          <Form.Item
            name="folio"
            label="Folio"
            rules={[{ required: true, message: 'Ingrese folio' }]}
          >
            <Input placeholder="Ingrese folio" style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="tipoDeIncidencia"
            label="Tipo de incidencia"
            rules={[{ required: true, message: 'Seleccione tipo de incidencia' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione tipo de incidencia"
              optionFilterProp="label"
              options={OPCIONES_DE_INCIDENCIA}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="diasAutorizados"
            label="Días autorizados"
            rules={[{ required: true, message: 'Ingrese días autorizados' }]}
          >
            <Input placeholder="Ingrese días autorizados" type="number" min={0} style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="fechaDeInicio"
            label="Fecha de inicio"
            rules={[{ required: true, message: 'Seleccione fecha de inicio' }]}
          >
            <DatePicker onChange={() => { }} style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="ramoDeSeguro"
            label="Ramo de seguro"
            rules={[{ required: true, message: 'Seleccione ramo de seguro' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione ramo de seguro"
              optionFilterProp="label"
              options={OPCIONES_RAMO_DE_SEGURO}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="tipoDeRiesgo"
            label="Tipo de riesgo"
            rules={[{ required: true, message: 'Seleccione tipo de riesgo' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione tipo de riesgo"
              optionFilterProp="label"
              options={OPCIONES_TIPO_DE_RIESGO}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="porcentajeDeIncapacidad"
            label="Porcentaje de incapacidad"
            rules={[{ required: true, message: 'Ingrese porcentaje de incapacidad' }]}
          >
            <Input placeholder="Ingrese porcentaje" type="number" min={0} max={100} style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="cantidadAPagar"
            label="Cantidad a pagar"
            rules={[{ required: true, message: 'Ingrese cantidad a pagar' }]}
          >
            <Input placeholder="Ingrese cantidad" type="number" min={0} style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="imss"
            label="IMSS"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="secuelaOConsecuencia"
            label="Secuela o consecuencia"
            rules={[{ required: true, message: 'Seleccione secuela o consecuencia' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione secuela o consecuencia"
              optionFilterProp="label"
              options={OPCIONES_SECUELA_O_CONSECUENCIA}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="controlDeIncapacidad"
            label="Control de incapacidad"
            rules={[{ required: true, message: 'Seleccione control de incapacidad' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione control de incapacidad"
              optionFilterProp="label"
              options={OPCIONES_CONTROL_DE_INCAPACIDAD}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'Ingrese descripción' }]}
          >
            <Input.TextArea placeholder="Ingrese descripción" style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          {/* <Form.Item
            name="ubicacion"
            label="Ubicación"
            rules={[{ required: true, message: 'Ingrese ubicación' }]}
          >
            <Input placeholder="Ingrese ubicación" style={style} />
          </Form.Item> */}

          <GoogleMaps title="Ubicación" showMap={false} />
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
  )
}

export default FormIncapacidadesNominas;