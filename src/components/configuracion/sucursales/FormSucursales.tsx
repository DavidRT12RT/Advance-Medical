"use client";
import { Button, Col, Divider, Flex, Form, Input, Row, Select, Switch, TimePicker, Tooltip } from 'antd';
import * as React from 'react'
import Swal from 'sweetalert2';
import {
  UndoOutlined,
  SaveOutlined,
  SmileOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setLoading, setNewSucursalId, setOpenDrawer, setRefresh } from '@/features/configuracionSlice';
import { setListaDeUsuarios, setOpenDrawerSucursal } from '@/features/recursosHumanosSlice';
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

const OPTIONS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];


const FormSucursales = ({ form }: any) => {

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
    listaDeUsuarios,
  } = useSelector((state: any) => state.recursosHumanos);

  React.useEffect(() => {
    FireStoreRecursosHumanos.listarUsuarios({
      idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : ""
    }).then((listaDeUsuarios) => {
      dispatch(setListaDeUsuarios(listaDeUsuarios));
    });
  }, []);

  const ENCARGADOS = (listaDeUsuarios || []).map((colaborador: any) => {
    return {
      label: `${colaborador?.nombres} ${colaborador?.apellidos}`,
      value: colaborador?.id
    };
  });

  // Función para obtener todos los días seleccionados en todos los horarios
  const getSelectedDays = () => {
    const values = form.getFieldsValue();
    const allSelectedDays = new Set<string>();
    values.horarios?.forEach((horario: any) => {
      horario?.dias?.forEach((dia: string) => {
        allSelectedDays.add(dia);
      });
    });
    return Array.from(allSelectedDays);
  };

  // Efecto para actualizar los días seleccionados cuando cambian los horarios
  React.useEffect(() => {
    const values = form.getFieldsValue();
    form.setFieldsValue(values);
  }, [form]);

  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        id: "",
        nombre: "",
        direccion: "",
        coordinates: { lat: null, lng: null },
        tipoSucursal: "",
        encargado: "",
        horarios: [],
        estadoDeOperacion: true,
      }}
      onFinish={async (values) => {
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
          const newSucursalId = await FireStoreConfiguracion.registrarSucursal(auth?.empresa?.id, {
            ...values,
            horarios: values.horarios.map((horario: any) => ({
              ...horario,
              inicio: horario.inicio.format('HH:mm:ss'),
              fin: horario.fin.format('HH:mm:ss'),
            })),
            direccion: address,
            coordinates
          });
          dispatch(setLoading(false));

          form.resetFields();
          dispatch(setOpenDrawer(false));
          dispatch(setOpenDrawerSucursal(false));
          dispatch(setNewSucursalId(newSucursalId));
          dispatch(setRefresh(Math.random()));

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Sucursal ${detalleDeSucursal?.id ? 'actualizada' : 'registrada'} con éxito!`,
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
      }} >

      <Row gutter={12} style={{ marginTop: "1rem" }}>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
            name="nombre"
            label="Nombre de sucursal"
            rules={[{ required: true, message: 'Ingrese Nombre de sucursal' }]}
          >
            <Input placeholder="Ingrese Nombre de sucursal" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <GoogleMaps title="Ingrese la dirección" />
        </Col>
        <Divider />
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="tipoSucursal"
            label="Tipo de sucursal"
            rules={[{ required: true, message: 'Seleccione Tipo de sucursal' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Tipo de sucursal"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={TIPO_DE_SUCURSAL}
            />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="encargado"
            label="Encargado"
            rules={[{ required: false, message: 'Seleccione Encargado' }]}
          >
            <Select
              showSearch
              style={style}
              placeholder="Seleccione Encargado"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={ENCARGADOS}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
      <Divider>Horarios de atención</Divider>
        <Form.List name="horarios">
          {(fields, { add, remove }) => (
            < >
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={12} align="middle">
                  <Col xs={12} sm={12} md={5}>
                    <Form.Item
                      {...restField}
                      name={[name, "inicio"]}
                      label="Hora inicio"
                      rules={[{ required: true, message: "Seleccione hora de inicio" }]}
                    >
                      <TimePicker 
                        onChange={(date, dateString: any) => { }} 
                        style={{ width: '100%', minWidth: '120px' }} 
                        placeholder="Inicio"
                        format="HH:mm:ss"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={5}>
                    <Form.Item
                      {...restField}
                      name={[name, "fin"]}
                      label="Hora fin"
                      rules={[{ required: true, message: "Seleccione hora de fin" }]}
                    >
                      <TimePicker 
                        onChange={(date, dateString: any) => { }} 
                        style={{ width: '100%', minWidth: '120px' }} 
                        placeholder="Fin"
                        format="HH:mm:ss"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={20} sm={20} md={12} lg={12} xl={12}>
                    <Form.Item
                      {...restField}
                      name={[name, "dias"]}
                      label="Días de atención"
                      rules={[{ required: true, message: "Seleccione días de atención" }]}
                    >
                      <Select
                        mode="multiple"
                        options={OPTIONS.filter(
                          (dia) => {
                            const currentValues = form.getFieldValue(['horarios', name, 'dias']) || [];
                            const otherSelectedDays = getSelectedDays().filter(
                              (d) => !currentValues.includes(d)
                            );
                            return !otherSelectedDays.includes(dia);
                          }
                        ).map((dia) => ({ label: dia, value: dia }))}
                        placeholder="Seleccione días"
                        style={{ width: '100%', minWidth: '300px', height: '32px' }}
                        maxTagCount="responsive"
                        listHeight={200}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={4} sm={4} md={2} lg={2} xl={2}>
                    <Form.Item
                      {...restField}
                      label=" "
                    >
                      <Tooltip title="Eliminar horario">
                        <Button type="dashed" shape="circle" icon={<MinusCircleOutlined />} danger onClick={() => remove(name)} />
                      </Tooltip>
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              <Button type="dashed" onClick={() => add()} block>
                Agregar horario
              </Button>
            </ >
          )}
        </Form.List>

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="estadoDeOperacion"
            label="Estado"
            rules={[{ required: true, message: 'Ingrese Estado' }]}
          >
            <Switch checkedChildren="Activa" unCheckedChildren="Inactiva" />
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
  )
}

export default FormSucursales;