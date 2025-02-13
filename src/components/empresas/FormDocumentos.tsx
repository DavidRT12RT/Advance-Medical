"use client";
import { Alert, Badge, Button, Col, DatePicker, Descriptions, Divider, Flex, Form, Grid, Input, Row, Select, Slider, Switch, Tag, TimePicker, Typography, Upload } from 'antd';
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
  FilePdfOutlined,
  EyeOutlined,
  CloudDownloadOutlined,
  LogoutOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setListaDeSucursales, setLoading, setOpenDrawer, setRefresh } from '@/features/configuracionSlice';
import { setListaDeUsuarios } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signOut } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import FireStoreEmpresas from '@/firebase/FireStoreEmpresas';
import { useRouter } from 'next/navigation';


const style: React.CSSProperties = { width: '100%' };
const { Search } = Input;
const { Title } = Typography;

const { useBreakpoint } = Grid;

let DOCUMENTOS: any = {
  "actaConstitutiva": "Acta constitutiva",
  "cfdi": "Cédula de identificación fiscal",
  "comprobanteDeDomicilioFiscal": "Comprobante de domicilio fiscal",
  "identificacionOficialFrente": "Identificación oficial frente",
  "identificacionOficialPosterior": "Identificación oficial posterior",
};

const uploadFilesEmpresaFB = async (file: any, postulanteId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `empresasFiles/${postulanteId}/${file?.name}`);
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



const FormDocumentos = () => {

  const router = useRouter();
  const [form] = Form.useForm();

  const screens = useBreakpoint();
  const [test, settest] = React.useState<any>({
    actaConstitutiva: [],
    cfdi: [],
    comprobanteDeDomicilioFiscal: [],
    identificacionOficialFrente: [],
    identificacionOficialPosterior: [],
  });

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const [loading, setloading] = React.useState(false);


  let DOCUMENTOS_SOLICITADOS: any = [
    { "actaConstitutiva": "Acta constitutiva" },
    { "cfdi": "Cédula de identificación fiscal " },
    { "comprobanteDeDomicilioFiscal": "Comprobante de domicilio fiscal" },
    { "identificacionOficialFrente": "Identificación oficial frente" },
    { "identificacionOficialPosterior": "Identificación oficial posterior" }

  ]
    .map((doc: any, index: number) => {
      const [[key, value]] = Object.entries(doc);
      const isImage = ["identificacionOficialFrente", "identificacionOficialPosterior"].includes(key);
      return [
        {
          key: `Documento-${String((index + 1))}`,
          label: "Documento",
          children: value,
        },
        {
          key: `Estado-${String((index + 1))}`,
          label: "Estado",
          children: <Badge status="warning" text="Pendiente" />,
        },
        {
          kkey: `Archivo-${String((index + 1))}`,
          label: "Archivo",
          children: (

            <Upload
              /* multiple */
              accept={isImage ? "image/*" : "application/pdf"}
              listType="picture"
              fileList={(test?.[key] || []).map((f: any) => ({
                ...f,
                name: `${f?.name?.length > 30 ? f?.name.slice(0, 30) + "..." : f?.name}`
              }))}
              maxCount={8}
              onChange={({ fileList: newFileList }: any) => {
                settest((oldData: any) => ({ ...oldData, [key]: newFileList.slice(-1) }));
              }}
              beforeUpload={() => false}
            >
              <Button block type="dashed" icon={isImage ? <FileImageOutlined /> : <FilePdfOutlined />}>Cargar archivo</Button>
            </Upload>

          ),
        }
      ]
    });


  if ((auth?.empresa?.documentos || []).length) {
    DOCUMENTOS_SOLICITADOS = (auth?.empresa?.documentos || [])
      .map((doc: any, index: number) => {
        return [
          {
            key: String((index + 1)),
            label: "Documento",
            children: DOCUMENTOS[doc?.documento] || "---",
          },
          {
            key: String((index + 1)),
            label: "Estado",
            children: <Badge
              status={
                doc?.estatus == "Aceptado"
                  ? "success"
                  : doc?.estatus == "Rechazado" ? "error" : "processing"
              }
              text={doc?.estatus || "---"} />,
          },
          {
            key: String((index + 1)),
            label: "Archivo",
            children: (
              <Button.Group>
                <Button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = doc?.url;
                    a.target = "_blank";
                    a.download = doc?.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  block
                  type="dashed"
                  icon={<EyeOutlined />}>Visualizar archivo</Button>
                <Button
                  onClick={async () => {
                    const a = document.createElement('a');
                    a.href = doc?.url;
                    a.target = "_blank";
                    a.download = doc?.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  block
                  type="dashed"
                  icon={<CloudDownloadOutlined />}>Descargar archivo</Button>
              </Button.Group>
            ),
          },

        ]
      });
  }


  DOCUMENTOS_SOLICITADOS = DOCUMENTOS_SOLICITADOS.flat();



  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%", padding: screens.md ? "3rem" : "1rem" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
      }}
      onFinish={async (values) => {
        try {
          const errors = Object.entries(test).filter(([key, value]: any) => {
            return !Boolean(value.length);
          });

          if (errors.length) {
            let html = "<div>";
            html += `<p style='text-align: center'>Seleccione los archivos requeridos: </p><br/>`;
            errors.forEach(([key, value]: any, index) => {
              html += `<p style='text-align: center'>* ${DOCUMENTOS[key]}</p>`;
            });
            html += "</div>";

            Swal.fire({
              title: "Documentos",
              html: html,
              icon: "warning"
            });
            return;
          }
          setloading(true);

          const idPostulante = uuidv4();
          // CARGAMOS LOS ARCHIVOS A STORAGE
          const allFiles = [];
          for (const key in test) {
            const [firstFile] = test[key];
            allFiles.push(uploadFilesEmpresaFB(firstFile?.originFileObj, idPostulante))
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

          const auth: any = getAuth();

          // ACTUALIZAMOS LA EMPRESA EN FIRESTORE
          await FireStoreEmpresas.registrarEmpresa({
            id: auth.currentUser?.uid,
            estatus: "En revisión",
            documentos: filesUploaded,
            fechaDocumentos: new Date().toISOString(),
          });

          settest({
            actaConstitutiva: [],
            cfdi: [],
            comprobanteDeDomicilioFiscal: []
          });
          setloading(false);

          await Swal.fire({
            icon: "success",
            title: "¡Gracias! Su información se ha enviado con éxito.",
            text: "Revisaremos su solicitud y nos pondremos en contacto pronto. ¡Gracias!"
          });

          location.reload();

        } catch (error: any) {
          console.log('error', error);
          Swal.fire({
            title: "ERROR",
            text: error?.toString(),
            icon: "error"
          });
        }

      }} >

      <Row gutter={12} style={{ marginTop: "1rem" }}>
        {auth?.empresa?.estatus == "En revisión" && (
          <Alert message="Tus documentos están en proceso de revisión. Recibirás un correo de confirmación una vez que se complete el análisis." type="info" showIcon />
        )}

        {auth?.empresa?.estatus == "Rechazado" && (
          <Alert message="Lamentablemente, tus documentos no han cumplido con los requisitos establecidos y han sido rechazados. Recibirás un correo con más detalles sobre el motivo del rechazo." type="error" showIcon />
        )}

        <Divider orientation="left">Documentación Legal y Fiscal</Divider>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ display: "none" }}>
          <Form.Item
            name="id"
            label="Id"
            rules={[{ required: false, message: 'Ingrese Id' }]}
          >
            <Input placeholder="Ingrese Id" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <div style={{ minWidth: screens.md ? "300px" : "600px", overflow: "auto" }}>
            <Descriptions size='small' column={1} bordered items={DOCUMENTOS_SOLICITADOS} />
          </div>
        </Col>
      </Row>


      <Row gutter={12}>
        <Divider />
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
            <Button disabled={(auth?.empresa?.documentos || []).length} loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit">
              Registrar
            </Button>
          </Flex>

          {auth?.empresa && (
            <Flex gap="small" style={{ width: '50%', margin: "auto", marginTop: "1rem" }}>
              <Button danger loading={loading} icon={<LogoutOutlined />} type="primary" block onClick={async () => {
                try {
                  await signOut(getAuth());
                  router.replace("/empresas/login");
                  console.log('Usuario deslogeado correctamente');
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                }
              }}>
                Cerrar sesión
              </Button>
            </Flex>
          )}
        </Col>

      </Row>
    </Form>
  )
}

export default FormDocumentos