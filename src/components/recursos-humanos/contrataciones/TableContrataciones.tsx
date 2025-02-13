"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonUsuarios from '../colaboradores/SkeletonColaboradores';
import { Button, Dropdown, message, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  FormOutlined,
  MoreOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { setDetalleDeContratacion, setOpenDrawer } from '@/features/recursosHumanosSlice';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);



const copyLink = async (link: any) => {
  try {
    await navigator.clipboard.writeText(`${location.origin}${link}`);
    return `${location.origin}${link}`;
  } catch (error) {
    Swal.fire({
      title: "ERROR",
      text: error?.toString(),
      icon: "error"
    });
  }
};


const TableContrataciones = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    loadingTable,
    listaDeContrataciones = [],
  } = useSelector((state: any) => state.recursosHumanos);


  const getMenuItems = (record: any): any[] => [
    {
      key: '1',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          form.resetFields();

          const {
            fechaDeApertura,
            ...others
          } = record;

          form.setFieldsValue({
            ...others,
            requisitosClave: "",
            prestaciones: "",
            documentosSolicitados: "",
            fechaDeApertura: fechaDeApertura
              ? dayjs(fechaDeApertura, "YYYY-MM-DD")
              : "",
          });

          dispatch(setDetalleDeContratacion({
            ...others,
            fechaDeApertura: fechaDeApertura
              ? dayjs(fechaDeApertura, "YYYY-MM-DD")
              : "",
          }));
          dispatch(setOpenDrawer(true));
        }}>Editar contratación</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setDetalleDeContratacion(record));
          router.push(`/recursos-humanos/contrataciones/${record?.id}`);
        }}>Ver detalle completo</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '3',
      label: (
        <a onClick={async (e) => {
          e.preventDefault();
          const link = await copyLink(`/contrataciones/${record?.id}`);
          messageApi.open({
            type: 'success',
            content: <span><a href={link}>{link}</a> copiado con éxito!</span>,
          });
        }}>Copiar link</a>
      ),
      icon: <CopyOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            title: "Seguro de desactivar contratación?",
            text: "",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Desactivado!",
                text: "",
                icon: "success"
              });
            }
          });
        }}>Desactivar contratación</a>
      ),
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de contrataciones, ${listaDeContrataciones.length} resultados`}</Typography.Title>,
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
          title: 'Nombre del puesto',
          dataIndex: 'nombreDelPuesto',
          key: 'nombreDelPuesto',
        },
        {
          title: 'Fecha de apertura',
          dataIndex: 'fechaDeApertura',
          key: 'fechaDeApertura',
        },
        {
          title: 'Salario aprox',
          dataIndex: 'salarioAproximado',
          key: 'salarioAproximado',
        },
        {
          title: 'Estado',
          dataIndex: 'estadoContratacion',
          key: 'estadoContratacion',
          render: (text, record, index) => {
            return text == "Activo"
              ? <Tag color="success">{text}</Tag>
              : <Tag color="processing">{text}</Tag>
          },
        },
        {
          title: 'Postulantes',
          dataIndex: 'postulantes',
          key: 'postulantes',
          render: (text, record, index) => <span>{text?.length.toString()}</span>,
        },
        {
          title: 'Pendientes',
          dataIndex: 'pendientesDeRevisar',
          key: 'pendientesDeRevisar',
          render: (text, record, index) => <span>{text?.length.toString()}</span>,
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

  /* if (loadingTable) {
    return <SkeletonUsuarios />
  } */

  return (
    <>
      {contextHolder}
      <Table
        loading={loadingTable}
        bordered
        columns={columns}
        dataSource={listaDeContrataciones}
        scroll={{
          x: 768,
        }} size="small" />
    </>

  )
}

export default TableContrataciones;