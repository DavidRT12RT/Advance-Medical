import { Button, Col, DatePicker, Divider, Flex, Form, Input, Radio, Row, Select, TimePicker, Upload } from 'antd';
import React from 'react'
import Swal from 'sweetalert2';
import { FileImageOutlined, UndoOutlined, SaveOutlined, InboxOutlined } from '@ant-design/icons';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { useDispatch, useSelector } from 'react-redux';
import { setIsModalOpen, setOpenDrawerFormPostulante, setRefresh } from '@/features/recursosHumanosSlice';
const style: React.CSSProperties = { width: '100%' };
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { enviarEmail } from '@/helpers/email';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const disablePastDates = (current: any) => {
  // Deshabilita las fechas anteriores a hoy
  return current && current < moment().startOf('day');
};

const MODALIDAD = [
  { label: 'Precencial', value: 'Precencial' },
  { label: 'Virtual', value: 'Virtual' },
];

const uploadFilesPostulanteFBFirma = async (file: any, postulanteId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `postulantesFilesFirma/${postulanteId}/${file?.name}`);
  try {
    // Subir imagen
    const { metadata } = await uploadBytes(storageRef, file, {
      contentType: file?.type,
    });
    const { bucket, contentType, name, fullPath } = metadata;
    // Obtener URL de descarga
    const imageUrl = await getDownloadURL(storageRef);
    return { url: imageUrl, bucket, contentType, name, fullPath };
  } catch (error) {
    throw error;
  }
};

const FormFirmarContrato = ({ form }: any) => {


  const dispatch = useDispatch();
  const [loading, setloading] = React.useState(false);

  const {
    detalleDelPostulante,
    detalleDeContratacion,
  } = useSelector((state: any) => state.recursosHumanos);

  // HANDLER UPLOAD
  const [fileList, setFileList] = React.useState<any[]>([]);
  const props = {
    fileList,
    multiple: true,
    beforeUpload: () => false, // Desactiva la carga automática
    onChange: ({ fileList: newFileList }: any) => {
      setFileList(newFileList);
    },
    maxCount: 10,
  };

  return (
    <Form
      form={form}
      name="login-form2"
      layout="vertical"
      style={{ width: "100%" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        id: "",
        notas: "",
        siguientePasoFirma: "",
      }}
      onFinish={async (values) => {

        try {
          setloading(true);

          // CARGAMOS LOS ARCHIVOS A STORAGE
          const allFiles: any[] = [];
          fileList.forEach(({ originFileObj }) => {
            allFiles.push(uploadFilesPostulanteFBFirma(originFileObj, detalleDelPostulante.id))
          });


          const responseFilesUpload = await Promise.all(allFiles);
          const filesUploaded: any[] = [];
          responseFilesUpload.forEach(({ url, contentType, fullPath, name }: any, index: number) => {
            filesUploaded.push({
              url,
              name,
              fullPath,
              contentType,
            });
          });

          // REGISTRAMOS DATOS DE LA ENTREVISTA
          await FireStoreRecursosHumanos.agregarPostulanteContratacion(
            detalleDeContratacion?.id,
            detalleDelPostulante.id,
            {
              estatus: "En firma",
              documentosFirma: filesUploaded
            });

          // ENVIAMOS UN CORREO CON LOSDETALLES DE LA ENTREVISTA
          await enviarEmail({
            to: detalleDelPostulante?.email,
            subject: "¡Felicitaciones! Has sido contratado(a)",
            plantilla: "generarPlantillaHTMLContratacion",
            nombrePostulante: detalleDelPostulante?.nombreCompleto || "",
            nombrePuesto: detalleDeContratacion?.nombreDelPuesto || "",
            nombreEmpresa: "smartroute",
            siguientePasoFirma: values?.siguientePasoFirma || "",
            telefonoOCorreo: `${detalleDelPostulante?.entrevista?.telefonoContacto || ""} ó ${detalleDelPostulante?.entrevista?.correoContacto || ""}`,
            nombreEncargado: (detalleDeContratacion?.personasResponsables || [])
              .map(({ nombres, apellidos }: any) => {
                return `${nombres} ${apellidos}`;
              }).toString(),

          });
          setloading(false);

          form.resetFields();
          dispatch(setIsModalOpen(false));
          dispatch(setRefresh(Math.random()));

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Firma de contrato registrada con éxito!`,
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
        <Divider orientation="left">Documentos de la entrevista</Divider>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>

          <div style={{ width: "100%", overflowY: "auto" }}>
            <Upload.Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click o arrastra archivos a esta área para cargarlos</p>
              <p className="ant-upload-hint">Soporte para subir múltiples archivos</p>
            </Upload.Dragger>
          </div>

        </Col>
        <Divider orientation="left" />
        <Col xs={24} sm={24} md={12} lg={24} xl={24}>
          <Form.Item
            name="notas"
            label="Notas"
            rules={[{ required: false, message: 'Ingrese Notas' }]}
          >
            <Input.TextArea showCount maxLength={400} rows={2} placeholder="Ingrese Notas" style={style} />
          </Form.Item>
        </Col>


        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="siguientePasoFirma"
            label="Siguiente paso para la firma"
            rules={[
              { required: true, message: "Ingrese Siguiente paso para la firma" },
            ]}
          >
            <Input.TextArea showCount maxLength={400} rows={2} placeholder="Ingrese Siguiente paso para la firma" style={style} />
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

export default FormFirmarContrato