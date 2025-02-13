"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonSolicitudesDeEmpresas from './SkeletonSolicitudesDeEmpresas';
import { Avatar, Button, Dropdown, Flex, MenuProps, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  FileDoneOutlined,
  EnvironmentOutlined,
  AimOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  EditOutlined,
  UserOutlined,
  EllipsisOutlined,
  MoreOutlined,
  FormOutlined,
  LikeOutlined,
  DislikeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { setOpenDrawer, setDetalleDeSucursal } from '@/features/configuracionSlice';
import { useRouter } from 'next/navigation';
import moment from "moment";
import { setDetalleDeSolicitud, setRefresh } from '@/features/administracionSlice';
import { enviarEmail } from '@/helpers/email';
import FireStoreAdministracion from '@/firebase/FireStoreAdministracion';

const { Title } = Typography;


const TableSolicitudesDeEmpresas = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();


  const {
    loadingTable,
    listaDeEmpresas = [],
  } = useSelector((state: any) => state.administracion);


  const getMenuItems = (record: any): any[] => [
    {
      key: '1',
      label: (
        <a onClick={async (e) => {
          e.preventDefault();
          try {
            await FireStoreAdministracion.registrarEmpresa({
              id: record?.id,
              estatus: "Aceptado",
              motivoRechazo: "",
              documentos: (record.documentos || []).map((documento: any) => {
                return { ...documento, estatus: "Aceptado" };
              })
            });
            await enviarEmail({
              to: record?.email,
              subject: "¡Enhorabuena! Su Empresa ha sido Aceptada en SMARTROUTE",
              plantilla: "generarPlantillaHTMLEmpresaAceptada",
              nombreContactoPrincipal: record?.nombre,
              nombreEmpresa: record?.nombreDeLaEmpresa,
              linkInicioSesion: `${location.origin}/empresas/login`
            });

            dispatch(setRefresh(Math.random()));
            Swal.fire({
              title: "Empresa aceptada!",
              text: "",
              icon: "success"
            });
          } catch (error: any) {
            Swal.fire({
              title: "Error!",
              text: error.toString(),
              icon: "error"
            });
          }
        }}>Aceptar empresa</a>
      ),
      icon: <CheckCircleOutlined />,
      disabled: !["En revisión"].includes(record?.estatus)
    },
    {
      key: '2',
      label: (
        <a onClick={async (e) => {
          e.preventDefault();
          try {
            const { value: text } = await Swal.fire({
              title: "Ingrese la razón del rechazo",
              input: "textarea",
              //inputLabel: "Ingresar la razón del rechazo",
              inputPlaceholder: "Ingrese la razón del rechazo...",
              inputAttributes: {
                "aria-label": "Ingrese la razón del rechazo"
              },
              showCancelButton: true,
              confirmButtonText: "Enviar",  // Cambia el texto del botón de confirmación
              cancelButtonText: "Cancelar", // Cambia el texto del botón de cancelación
              confirmButtonColor: '#1677ff', // Color del botón OK
              cancelButtonColor: '#ff4d4f',    // Color del botón Cancelar
              preConfirm: (value) => {
                if (!value) {
                  Swal.showValidationMessage("Ingrese la razón del rechazo");
                  return false; // Impide que se cierre el modal si no hay texto
                }
                return value; // Retorna el valor si pasa la validación
              }
            });

            if (text) {

              await FireStoreAdministracion.registrarEmpresa({
                id: record?.id,
                estatus: "Rechazado",
                motivoRechazo: text,
                documentos: (record.documentos || []).map((documento: any) => {
                  return { ...documento, estatus: "Rechazado" };
                })
              });

              await enviarEmail({
                to: record?.email,
                subject: "Información sobre el Proceso de Registro en SMARTROUTE",
                plantilla: "generarPlantillaHTMLRegistroRechazo",
                nombreContactoPrincipal: record?.nombre,
                nombreEmpresa: record?.nombreDeLaEmpresa,
                motivoRechazo: text
              });

              dispatch(setRefresh(Math.random()));
              Swal.fire({
                title: "Empresa rechazada!",
                text: "",
                icon: "success"
              });
            }
          } catch (error: any) {
            Swal.fire({
              title: "Error!",
              text: error.toString(),
              icon: "error"
            });
          }
        }}>Rechazar empresa</a>
      ),
      icon: <CloseCircleOutlined />,
      disabled: !["En revisión"].includes(record?.estatus)
    },
    {
      key: '3',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setDetalleDeSolicitud(record));
          router.push(`/administracion/solicitudes/${record?.id}`);
        }}>Ver más detalles</a>
      ),
      icon: <EyeOutlined />,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Title level={5}>{`Lista de solicitudes, ${listaDeEmpresas.length} resultados`}</Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'N°',
          dataIndex: 'numero',
          key: 'numero',
          width: 50,
          render: (text, record, index) => <div>{(index + 1)}</div>,
        },
        {
          title: 'Nombre de la empresa',
          dataIndex: 'nombreDeLaEmpresa',
          key: 'nombreDeLaEmpresa',

        },
        {
          title: 'Correo de contacto',
          dataIndex: 'email',
          key: 'email',
        },
        {
          title: 'Giro de empresa',
          dataIndex: 'giroDeLaEmpresa',
          key: 'giroDeLaEmpresa',
        },
        {
          title: 'Fecha',
          dataIndex: 'fechaRegistro',
          key: 'fechaRegistro',
          render: (text, record, index) => (text?.slice(0, 10)),
        },
        {
          title: 'Estatus',
          dataIndex: 'estatus',
          key: 'estatus',
          render: (text, record, index) => {
            return <Tag color={["Aceptado"].includes(text) ? "success" : ["Rechazado"].includes(text) ? "error" : "processing"}>{text}</Tag>
          },
        },
        {
          title: '',
          align: 'center',
          width: 50,
          render: (_, record) => {
            return (
              <Dropdown menu={{
                items: getMenuItems(record)
              }} placement="bottomRight" trigger={['click']}>
                <Tooltip title="Acciones">
                  <Button shape="circle" icon={<MoreOutlined />} />
                </Tooltip>
              </Dropdown>
            )
          },
        },
      ],
    },

  ];

  if (loadingTable) {
    return <SkeletonSolicitudesDeEmpresas />
  }

  return (
    <Table
      bordered
      columns={columns}
      dataSource={listaDeEmpresas}
      scroll={{
        x: 768,
      }} size="small" />
  )
}

export default TableSolicitudesDeEmpresas;