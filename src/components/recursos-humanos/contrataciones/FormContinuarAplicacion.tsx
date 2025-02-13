import { Button, Col, DatePicker, Divider, Flex, Form, Input, Radio, Row, Select, TimePicker } from 'antd';
import React from 'react'
import Swal from 'sweetalert2';
import { FileImageOutlined, UndoOutlined, SaveOutlined } from '@ant-design/icons';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenDrawerFormPostulante, setRefresh } from '@/features/recursosHumanosSlice';
const style: React.CSSProperties = { width: '100%' };
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { enviarEmail } from '@/helpers/email';

const disablePastDates = (current: any) => {
  // Deshabilita las fechas anteriores a hoy
  return current && current < moment().startOf('day');
};

const MODALIDAD = [
  { label: 'Precencial', value: 'Precencial' },
  { label: 'Virtual', value: 'Virtual' },
];

const FormContinuarAplicacion = ({ form }: any) => {


  const dispatch = useDispatch();
  const [modalidad, setmodalidad] = React.useState("Virtual");
  const [loading, setloading] = React.useState(false);

  const {
    detalleDelPostulante,
    detalleDeContratacion,
  } = useSelector((state: any) => state.recursosHumanos);



  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        id: "",
        fecha: "",
        hora: "",
        modalidad: "Virtual",
        direccionOLink: "",
        telefonoContacto: "",
        correoContacto: "",
      }}
      onFinish={async (values) => {

        try {
          setloading(true);
          // REGISTRAMOS DATOS DE LA ENTREVISTA
          await FireStoreRecursosHumanos.agregarPostulanteContratacion(
            detalleDeContratacion?.id,
            detalleDelPostulante.id,
            {
              estatus: "En entrevista",
              entrevista: {
                ...values,
                id: values?.id || uuidv4(),
                fecha: values?.fecha.format('YYYY-MM-DD'),
                hora: values?.hora.format('HH:mm:ss')
              },
              documentos: (detalleDelPostulante.documentos || []).map((documento: any) => {
                return { ...documento, estatus: "Aceptado" };
              })
            });


          // ENVIAMOS UN CORREO CON LOSDETALLES DE LA ENTREVISTA
          if (values?.id) {// UPDATE
            await enviarEmail({
              to: detalleDelPostulante?.email,
              subject: "Actualización en tu entrevista programada",
              plantilla: "generarPlantillaHTMLActualizacion",
              nombrePostulante: detalleDelPostulante?.nombreCompleto || "",
              nombrePuesto: detalleDeContratacion?.nombreDelPuesto || "",
              nuevaFechaEntrevista: values?.fecha.format('YYYY-MM-DD'),
              nuevaHoraEntrevista: values?.hora.format('HH:mm:ss'),
              modalidadEntrevista: values?.modalidad || "",
              nuevaDireccionOEnlaceEntrevista: values?.direccionOLink || "",
              telefonoOCorreo: `${values?.telefonoContacto || ""} ó ${values?.correoContacto || ""}`,

              nombreEncargado: (detalleDeContratacion?.personasResponsables || [])
                .map(({ nombres, apellidos }: any) => {
                  return `${nombres} ${apellidos}`;
                }).toString(),
              nombreEmpresa: "smartroute",
            });
          } else { // REGISTER
            await enviarEmail({
              to: detalleDelPostulante?.email,
              subject: "¡Documentos aprobados! Próxima etapa: Entrevista programada",
              plantilla: "generarPlantillaHTMLAprobacion",
              nombrePostulante: detalleDelPostulante?.nombreCompleto || "",
              fechaEntrevista: values?.fecha.format('YYYY-MM-DD'),
              horaEntrevista: values?.hora.format('HH:mm:ss'),
              modalidadEntrevista: values?.modalidad || "",
              lugarOEnlaceEntrevista: values?.direccionOLink || "",
              telefonoOCorreo: `${values?.telefonoContacto || ""} ó ${values?.correoContacto || ""}`,
              // nombrePuesto: detalleDeContratacion?.nombreDelPuesto || "",
              nombreEncargado: (detalleDeContratacion?.personasResponsables || [])
                .map(({ nombres, apellidos }: any) => {
                  return `${nombres} ${apellidos}`;
                }).toString(),
              nombreEmpresa: "smartroute",
            });
          }
          setloading(false);

          form.resetFields();
          dispatch(setRefresh(Math.random()));
          dispatch(setOpenDrawerFormPostulante(false));

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Entrevista ${detalleDeContratacion?.id ? 'actualizada' : 'registrada'} con éxito!`,
            showConfirmButton: false,
            timer: 3000
          });
        } catch (error: any) {
          console.log('error', error);
          Swal.fire({
            title: "ERROR",
            text: error?.toString(),
            icon: "error"
          });
        } finally {
          setloading(false);
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
            name="fecha"
            label="Fecha"
            rules={[{ required: true, message: 'Seleccione Fecha' }]}
          >
            <DatePicker disabledDate={disablePastDates} onChange={(date, dateString: any) => { }} style={style} placeholder='Seleccione Fecha' />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="hora"
            label="Hora"
            rules={[{ required: true, message: 'Seleccione Hora' }]}
          >
            <TimePicker onChange={(date, dateString: any) => { }} style={style} placeholder='Seleccione Hora' />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Form.Item
            name="modalidad"
            label="Modalidad"
            rules={[
              { required: true, message: 'Seleccione Modalidad' },
            ]}
          >
            <Radio.Group options={MODALIDAD} onChange={(e: any) => {
              setmodalidad(e.target.value);
            }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="direccionOLink"
            label={modalidad == "Precencial" ? "Dirección" : "Link"}
            rules={[
              { required: true, message: `Ingrese ${modalidad === "Precencial" ? "Dirección" : "Link"}` },
              modalidad !== "Precencial" ? {
                type: "url",
                message: "Ingrese un link válido",
              } : {}
            ]}
          >
            <Input showCount maxLength={200} placeholder={`Ingrese ${modalidad == "Precencial" ? "Dirección" : "Link"}`} style={style} />
          </Form.Item>

        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Form.Item
            name="telefonoContacto"
            label="Teléfono de contacto"
            rules={[
              { required: true, message: "Ingrese Teléfono de contacto" },
            ]}
          >
            <Input placeholder="Ingrese Teléfono de contacto" style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={16} lg={16} xl={16}>
          <Form.Item
            name="correoContacto"
            label="Correo de contacto"
            rules={[
              { required: true, message: "Ingrese Correo de contacto" },
              { type: 'email', message: 'Ingrese un correo válido' },
            ]}
          >
            <Input placeholder="Ingrese Correo de contacto" style={style} />
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

export default FormContinuarAplicacion