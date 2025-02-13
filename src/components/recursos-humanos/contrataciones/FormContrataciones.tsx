import { Button, Col, DatePicker, Divider, Flex, Form, Input, Row, Select, Tag } from 'antd';
import React, { useRef } from 'react'
import Swal from 'sweetalert2';
import {
  CheckOutlined,
  UndoOutlined,
  SaveOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setListaDeUsuarios, setLoading, setOpenDrawer, setRefresh } from '@/features/recursosHumanosSlice';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const style: React.CSSProperties = { width: '100%' };

export const ROLES = [
  { value: 'Desarrollador', label: 'Desarrollador' },
  { value: 'Gerente', label: 'Gerente' },
  { value: 'Asistente', label: 'Asistente' },
  { value: 'Analista', label: 'Analista' },
  { value: 'Coordinador', label: 'Coordinador' },
  { value: 'Director', label: 'Director' },
  { value: 'Consultor', label: 'Consultor' },
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Arquitecto', label: 'Arquitecto' },
  { value: 'Ingeniero', label: 'Ingeniero' },
];

export const DEPARTAMENTOS = [
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Recursos Humanos', label: 'Recursos Humanos' },
  { value: 'Finanzas', label: 'Finanzas' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Ventas', label: 'Ventas' },
  { value: 'Operaciones', label: 'Operaciones' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Atención al Cliente', label: 'Atención al Cliente' },
  { value: 'Logística', label: 'Logística' },
  { value: 'Compras', label: 'Compras' },
];


const FormContrataciones = ({ form }: any) => {

  const dispatch = useDispatch();

  const {
    loading,
    listaDeUsuarios,
    detalleDeContratacion
  } = useSelector((state: any) => state.recursosHumanos);
  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const requisitosClaveRef = useRef<any>();
  const prestacionesRef = useRef<any>();
  const documentosSolicitadosRef = useRef<any>();

  const [requisitosClave, setrequisitosClave] = React.useState<any[]>([]);
  const [prestaciones, setprestaciones] = React.useState<any[]>([]);
  const [documentosSolicitados, setdocumentosSolicitados] = React.useState<any[]>([]);

  React.useEffect(() => {
    FireStoreRecursosHumanos.listarUsuarios({
      idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : ""
    }).then((listaDeUsuarios) => {
      dispatch(setListaDeUsuarios(listaDeUsuarios));
    });
  }, []);

  const PERSONAS_RESPONSABLES = listaDeUsuarios.map((colaborador: any) => {
    return {
      label: `${colaborador?.nombres} ${colaborador?.apellidos}`,
      value: colaborador?.id
    };
  });

  React.useEffect(() => {
    if (detalleDeContratacion) {
      setrequisitosClave(detalleDeContratacion?.requisitosClave || []);
      setprestaciones(detalleDeContratacion?.prestaciones || []);
      setdocumentosSolicitados(detalleDeContratacion?.documentosSolicitados || []);
    } else {
      setrequisitosClave([]);
      setprestaciones([]);
      setdocumentosSolicitados([]);
    }
  }, [detalleDeContratacion]);



  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        id: "",
        nombreDelPuesto: "",
        descripcionDelPuesto: "",
        rol: "",
        departamento: "",
        fechaDeApertura: "",
        salarioAproximado: "",
        personasResponsables: [],
        requisitosClave: "",
        prestaciones: "",
        documentosSolicitados: "",
      }}
      onFinish={async (values) => {

        try {
          dispatch(setLoading(true));
          // REGISTRAMOS EL USUARIO EN FIRESTORE
          await FireStoreRecursosHumanos.registrarContratacion({
            idEmpresa: auth?.empresa?.id,
            ...values,
            requisitosClave,
            prestaciones,
            documentosSolicitados,
            estadoContratacion: "Activo",
            postulantes: [],
            pendientesDeRevisar: [],
            fechaDeApertura: values?.fechaDeApertura
              ? values?.fechaDeApertura?.format("YYYY-MM-DD")
              : "",
          });
          dispatch(setLoading(false));

          form.resetFields();
          dispatch(setOpenDrawer(false));
          dispatch(setRefresh(Math.random()));

          setrequisitosClave([]);
          setprestaciones([]);
          setdocumentosSolicitados([]);

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Contratación ${detalleDeContratacion?.id ? 'actualizada' : 'registrada'} con éxito!`,
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

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          {/* start input hidden */}
          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: 'Ingrese Id' }]}
          >
            <Input placeholder="Ingrese Nombres" style={style} />
          </Form.Item>
          {/* end input hidden */}
          <Form.Item
            name="nombreDelPuesto"
            label="Nombre del puesto"
            rules={[{ required: true, message: 'Ingrese Nombre del puesto' }]}
          >
            <Input placeholder="Ingrese Nombre del puesto" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={16} xl={16}>
          <Form.Item
            name="descripcionDelPuesto"
            label="Descripción del puesto"
            rules={[{ required: true, message: 'Ingrese Descripción del puesto' }]}
          >
            <Input showCount maxLength={200} placeholder="Ingrese Descripción del puesto" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="rol"
            label="Rol"
            rules={[{ required: true, message: 'Seleccione Rol' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Rol"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={ROLES}
            />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="departamento"
            label="Departamento"
            rules={[{ required: true, message: 'Seleccione Departamento' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Departamento"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={DEPARTAMENTOS}
            />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="fechaDeApertura"
            label="Fecha de apertura"
            rules={[{ required: true, message: 'Seleccione Fecha de apertura' }]}
          >
            <DatePicker onChange={(date, dateString: any) => { }} style={style} placeholder='Seleccione Fecha de apertura' />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="salarioAproximado"
            label="Salario aproximado"
            rules={[{ required: true, message: 'Ingrese Salario aproximado' }]}
          >
            <Input type='number' placeholder="Ingrese Salario aproximado" style={style} />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={16} xl={16}>
          <Form.Item
            name="personasResponsables"
            label="Personas responsables"
            rules={[{ required: true, message: 'Seleccione Personas responsables' }]}
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Seleccione Personas responsables"
              // defaultValue={[]}
              onChange={() => { }}
              options={PERSONAS_RESPONSABLES}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button block type="text" icon={<PlusOutlined />} onClick={() => {
                    /* // Abrir el formulario de registrar articulos
                    formClientes.resetFields();

                    dispatch(setPerfilClientes(null));
                    dispatch(setOpenDrawerVentas(true)); */
                  }}>
                    Nuevo responsable
                  </Button>
                </>
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Form.Item
            name="requisitosClave"
            label="Requisitos clave + ENTER"
            rules={[{ required: requisitosClave.length ? false : true, message: 'Ingrese Requisitos clave' }]}
          >
            <Input ref={requisitosClaveRef} allowClear placeholder="Ingrese Requisitos clave" style={style}
              onKeyDown={(e: any) => {
                const value = e.target.value.trim();
                if (e.key === 'Enter' && value) { // Detectar Enter
                  if (!requisitosClave.includes(value)) {
                    setrequisitosClave((oldData) => ([...oldData, value]));
                    form.resetFields(['requisitosClave']);
                    setTimeout(() => {
                      requisitosClaveRef.current.focus(); // Poner el foco en el Input nuevamente
                    }, 100);
                  }
                  e.preventDefault(); // Prevenir salto de línea
                }
              }}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value) {
                  if (!requisitosClave.includes(value)) {
                    setrequisitosClave((oldData) => ([...oldData, value]));
                    form.resetFields(['requisitosClave']);
                  }
                  e.preventDefault(); // Prevenir salto de línea
                }
              }} />

            <Flex gap="4px 0" wrap style={{ ...style, margin: "0.5rem 0rem" }}>
              {requisitosClave.map((item, index) => (
                <Tag
                  style={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    display: 'flex', // Usar flexbox para alinear la "X"
                    alignItems: 'center', // Alinear el texto y la "X"
                  }}
                  key={index}
                  closable
                  icon={<CheckOutlined />}
                  color='#1a88ff'// verde
                  onClose={() => setrequisitosClave((oldData) => (oldData.filter((tag) => tag != item)))}
                >
                  <span style={{ flex: 1 }}>{item}</span>
                </Tag>
              ))}
            </Flex>
          </Form.Item>

        </Col>

        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Form.Item
            name="prestaciones"
            label="Prestaciones + ENTER"
            rules={[{ required: prestaciones.length ? false : true, message: 'Ingrese Prestaciones' }]}
          >
            <Input ref={prestacionesRef} allowClear placeholder="Ingrese Prestaciones" style={style}
              onKeyDown={(e: any) => {
                const value = e.target.value.trim();
                if (e.key === 'Enter' && value) { // Detectar Enter
                  if (!prestaciones.includes(value)) {
                    setprestaciones((oldData) => ([...oldData, value]));
                    form.resetFields(['prestaciones']);
                    setTimeout(() => {
                      prestacionesRef.current.focus(); // Poner el foco en el Input nuevamente
                    }, 100);
                  }
                  e.preventDefault(); // Prevenir salto de línea
                }
              }}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value) {
                  if (!prestaciones.includes(value)) {
                    setprestaciones((oldData) => ([...oldData, value]));
                    form.resetFields(['prestaciones']);
                  }
                  e.preventDefault(); // Prevenir salto de línea
                }
              }} />

            <Flex gap="4px 0" wrap style={{ ...style, margin: "0.5rem 0rem" }}>
              {prestaciones.map((item, index) => (
                <Tag
                  style={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    display: 'flex', // Usar flexbox para alinear la "X"
                    alignItems: 'center', // Alinear el texto y la "X"
                  }}
                  key={index}
                  closable
                  icon={<CheckOutlined />}
                  color='#1a88ff'// verde
                  onClose={() => setprestaciones((oldData) => (oldData.filter((tag) => tag != item)))}
                >
                  <span style={{ flex: 1 }}>{item}</span>
                </Tag>
              ))}
            </Flex>
          </Form.Item>

        </Col>

        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Form.Item
            name="documentosSolicitados"
            label="Documentos solicitados + ENTER"
            rules={[{ required: documentosSolicitados.length ? false : true, message: 'Ingrese Documentos solicitados' }]}
          >
            <Input ref={documentosSolicitadosRef} allowClear placeholder="Ingrese Documentos solicitados" style={style}
              onKeyDown={(e: any) => {
                const value = e.target.value.trim();
                if (e.key === 'Enter' && value) { // Detectar Enter
                  if (!documentosSolicitados.includes(value)) {
                    setdocumentosSolicitados((oldData) => ([...oldData, value]));
                    form.resetFields(['documentosSolicitados']);
                    setTimeout(() => {
                      documentosSolicitadosRef.current.focus(); // Poner el foco en el Input nuevamente
                    }, 100);
                  }
                  e.preventDefault(); // Prevenir salto de línea
                }
              }}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value) {
                  if (!documentosSolicitados.includes(value)) {
                    setdocumentosSolicitados((oldData) => ([...oldData, value]));
                    form.resetFields(['documentosSolicitados']);
                  }
                  e.preventDefault(); // Prevenir salto de línea
                }
              }} />

            <Flex gap="4px 0" wrap style={{ ...style, margin: "0.5rem 0rem" }}>
              {documentosSolicitados.map((item, index) => (
                <Tag
                  style={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    display: 'flex', // Usar flexbox para alinear la "X"
                    alignItems: 'center', // Alinear el texto y la "X"
                  }}
                  key={index}
                  closable
                  icon={<CheckOutlined />}
                  color='#1a88ff'// verde
                  onClose={() => setdocumentosSolicitados((oldData) => (oldData.filter((tag) => tag != item)))}
                >
                  <span style={{ flex: 1 }}>{item}</span>
                </Tag>
              ))}
            </Flex>
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

export default FormContrataciones