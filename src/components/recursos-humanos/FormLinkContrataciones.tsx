import { Badge, Button, Col, DatePicker, Descriptions, Divider, Flex, Form, Grid, Input, List, Row, Select, Slider, Space, Tag, Typography, Upload } from 'antd';
import React, { useRef } from 'react'
import Swal from 'sweetalert2';
import {
  AimOutlined,
  FileTextOutlined,
  PlusOutlined,
  CheckOutlined,
  UndoOutlined,
  SaveOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setListaDeUsuarios, setLoading, setOpenDrawer, setRefresh } from '@/features/recursosHumanosSlice';
import { ESTADOS_CIVIL, GENEROS } from './colaboradores/FormColaboradores';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
const { Text, Link } = Typography;
const style: React.CSSProperties = { width: '100%' };
import { v4 as uuidv4 } from 'uuid';


const uploadFilesPostulanteFB = async (file: any, postulanteId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `postulantesFiles/${postulanteId}/${file?.name}`);
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

const FormLinkContrataciones = ({ form }: any) => {

  const dispatch = useDispatch();

  const [test, settest] = React.useState<any>();

  const {
    loading,
    detalleDeContratacion
  } = useSelector((state: any) => state.recursosHumanos);

  React.useEffect(() => {
    if (detalleDeContratacion) {
      const result: any = {};
      (detalleDeContratacion?.documentosSolicitados || []).forEach((doc: string) => {
        result[doc] = []; // Asigna un array vacío a cada clave
      });
      settest(result);
    }

  }, [detalleDeContratacion]);


  let DOCUMENTOS_SOLICITADOS = (detalleDeContratacion?.documentosSolicitados || [])
    .map((doc: string, index: number) => {
      return [
        {
          key: `Documento-${String((index + 1))}`,
          label: "Documento",
          children: doc,
        },
        {
          key: `Estado-${String((index + 1))}`,
          label: "Estado",
          children: <Badge status="warning" text="Pendiente" />,
        },
        {
          key: `Archivo-${String((index + 1))}`,
          label: "Archivo",
          children: (
            <Upload
              /* multiple */
              listType="picture"
              fileList={(test?.[doc] || [])}
              maxCount={8}
              onChange={({ fileList: newFileList }: any) => {
                settest((oldData: any) => ({ ...oldData, [doc]: newFileList.slice(-1) }));
              }}
              beforeUpload={() => false}
            >
              <Button block type="dashed" icon={<CloudUploadOutlined />}>Cargar archivo</Button>
            </Upload>
          ),
        }
      ]
    });

  DOCUMENTOS_SOLICITADOS = DOCUMENTOS_SOLICITADOS.flat();

  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        nombreCompleto: "",
        email: "",
        telefono: "",
        direccion: "",
        fechaDeNacimiento: "",
        genero: "",
        estadoCivil: "",
        numeroDeSeguroSocial: "",
        curp: "",
        rfc: "",
        // referencias
        nombresRef1: "",
        telefonoRef1: "",
        nombresRef2: "",
        telefonoRef2: "",
        nombresRef3: "",
        telefonoRef3: "",
        // documentos
      }}
      onFinish={async (values) => {

        try {
          const errors = Object.entries(test).filter(([key, value]: any) => {
            return !Boolean(value.length);
          });

          if (errors.length) {
            let html = "<div>";
            html += `<p style='text-align: center'>Seleccione los archivos requeridos : </p>`;
            errors.forEach(([key, value]: any) => {
              html += `<p style='text-align: center'>${key}</p>`;
            });
            html += "</div>";

            Swal.fire({
              title: "Documentos",
              html: html,
              icon: "warning"
            });
            return;
          }

          dispatch(setLoading(true));

          const idPostulante = uuidv4();
          // CARGAMOS LOS ARCHIVOS A STORAGE
          const allFiles = [];
          for (const key in test) {
            const [firstFile] = test[key];
            allFiles.push(uploadFilesPostulanteFB(firstFile?.originFileObj, idPostulante))
          }

          const responseFilesUpload = await Promise.all(allFiles);
          const filesUploaded: any[] = [];
          responseFilesUpload.forEach(({ url, contentType, fullPath, name }: any, index: number) => {
            filesUploaded.push({
              documento: Object.keys(test)[index],
              estatus: "En revisión",
              url,
              name,
              fullPath,
              contentType,
            });
          });

          // REGISTRAMOS EL USUARIO EN FIRESTORE
          await FireStoreRecursosHumanos.agregarPostulanteContratacion(
            detalleDeContratacion?.id,
            idPostulante,
            {
              ...values,
              estatus: "En revisión",
              documentos: filesUploaded,
              fecha: new Date().toISOString(),
              fechaDeNacimiento: values?.fechaDeNacimiento
                ? values?.fechaDeNacimiento?.format("YYYY-MM-DD")
                : "",
            });


          dispatch(setLoading(false));
          form.resetFields();

          // LIMPIAMOS FILES
          const result: any = {};
          (detalleDeContratacion?.documentosSolicitados || []).forEach((doc: string) => {
            result[doc] = []; // Asigna un array vacío a cada clave
          });
          settest(result);

          Swal.fire({
            icon: "success",
            title: "¡Gracias! Su información se ha enviado con éxito.",
          });
        } catch (error: any) {
          console.log('error', error);
          Swal.fire({
            title: "ERROR",
            text: error?.toString(),
            icon: "error"
          });
        }

      }} >

      <Row gutter={12}>

        <Divider orientation="left"></Divider>

        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            name="nombreCompleto"
            label="Nombre completo"
            rules={[{ required: true, message: 'Ingrese Nombre completo' }]}
          >
            <Input placeholder="Ingrese Nombre completo" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="email"
            label="Correo electrónico"
            rules={[
              { required: true, message: 'Ingrese Correo electrónico' },
              { type: 'email', message: 'Ingrese Correo electrónico válido' }
            ]}
          >
            <Input placeholder="Ingrese Correo electrónico" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: 'Ingrese Teléfono' }]}
          >
            <Input placeholder="Ingrese Teléfono" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={16} xl={16}>
          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[{ required: true, message: 'Ingrese Dirección' }]}
          >
            <Input showCount maxLength={200} placeholder="Ingrese Dirección" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="fechaDeNacimiento"
            label="Fecha de nacimiento"
            rules={[{ required: true, message: 'Seleccione Fecha de nacimiento' }]}
          >
            <DatePicker onChange={(date, dateString: any) => { }} style={style} placeholder='Seleccione Fecha de nacimiento' />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="genero"
            label="Género"
            rules={[{ required: true, message: 'Seleccione Género' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Género"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={GENEROS}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Form.Item
            name="estadoCivil"
            label="Estado civil"
            rules={[{ required: true, message: 'Seleccione Estado civil' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Estado civil"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={ESTADOS_CIVIL}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Form.Item
            name="numeroDeSeguroSocial"
            label="Número de seguro social"
            rules={[{ required: true, message: 'Ingrese Número de seguro social' }]}
          >
            <Input maxLength={11} placeholder="Ingrese Número de seguro social" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="curp"
            label="CURP"
            rules={[{ required: true, message: 'Ingrese CURP' }]}
          >
            <Input placeholder="Ingrese CURP" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="rfc"
            label="RFC"
            rules={[{ required: true, message: 'Ingrese RFC' }]}
          >
            <Input placeholder="Ingrese RFC" style={style} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>

        <Divider orientation="left">Referencias</Divider>

        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="nombresRef1"
            label="Nombres"
            rules={[{ required: true, message: 'Ingrese Nombres' }]}
          >
            <Input placeholder="Ingrese Nombres" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="telefonoRef1"
            label="Teléfono"
            rules={[{ required: true, message: 'Ingrese Teléfono' }]}
          >
            <Input placeholder="Ingrese Teléfono" style={style} />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="nombresRef2"
            label="Nombres"
            rules={[{ required: true, message: 'Ingrese Nombres' }]}
          >
            <Input placeholder="Ingrese Nombres" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="telefonoRef2"
            label="Teléfono"
            rules={[{ required: true, message: 'Ingrese Teléfono' }]}
          >
            <Input placeholder="Ingrese Teléfono" style={style} />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="nombresRef3"
            label="Nombres"
            rules={[{ required: true, message: 'Ingrese Nombres' }]}
          >
            <Input placeholder="Ingrese Nombres" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="telefonoRef3"
            label="Teléfono"
            rules={[{ required: true, message: 'Ingrese Teléfono' }]}
          >
            <Input placeholder="Ingrese Teléfono" style={style} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>

        <Divider orientation="left">Documentos</Divider>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Descriptions size='small' column={1} bordered items={DOCUMENTOS_SOLICITADOS} />
        </Col>

      </Row>

      <Row gutter={0}>
        <Divider></Divider>

        <Col xs={24}>
          <Flex gap="small" style={{ minWidth: '25%', maxWidth: "55%", margin: "auto" }}>
            <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit">
              Enviar información
            </Button>
          </Flex>
        </Col>
      </Row>
    </Form>
  )
}

export default FormLinkContrataciones