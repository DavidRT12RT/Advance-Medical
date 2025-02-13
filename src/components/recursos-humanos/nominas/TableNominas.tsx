"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Drawer, Dropdown, message, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  FormOutlined,
  MoreOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { setColaboradoresSeleccionados, setDetalleDeContratacion, setDetalleDeNomina, setOpenDrawer, setOpenDrawerNomina } from '@/features/recursosHumanosSlice';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { NumberFormatUSD } from '@/helpers/functions';
import TableTemporal from './TableTemporal';

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


const TableNominas = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    loadingTable,
    listaDeNominas = [],
    openDrawerNomina
  } = useSelector((state: any) => state.recursosHumanos);
  console.log('listaDeNominas', listaDeNominas)

  const getMenuItems = (record: any): any[] => [
    {
      key: '1',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          router.push(`/recursos-humanos/nominas/${record?.id}`);

          /*  form.resetFields();
 
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
           dispatch(setOpenDrawer(true)); */
        }}>Editar nómina</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setColaboradoresSeleccionados(record?.colaboradoresNominas));
          dispatch(setOpenDrawerNomina(true));
          /*  form.resetFields();
 
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
 
           dispatch(colaboradoresSeleccionados({
             ...others,
             fechaDeApertura: fechaDeApertura
               ? dayjs(fechaDeApertura, "YYYY-MM-DD")
               : "",
           }));
           dispatch(setOpenDrawer(true)); */
        }}>Ver nómina</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '3',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          router.push(`/recursos-humanos/nominas/reusar/${record?.id}?reusar=${record?.id}`);
          /* dispatch(setDetalleDeContratacion(record));
          router.push(`/recursos-humanos/contrataciones/${record?.id}`); */
        }}>Reusar nómina</a>
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
            title: "Seguro de cancelar nómina?",
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
                title: "Nómina cancelada!",
                text: "",
                icon: "success"
              });
            }
          });
        }}>Cancelar nómina</a>
      ),
      icon: <DeleteOutlined />,
      danger: true
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de nóminas, ${listaDeNominas.length} resultados`}</Typography.Title>,
      dataIndex: 'nomina',
      key: 'nomina',
      children: [
        {
          title: 'Fecha de la nómina',
          dataIndex: 'fechaRegistroDoc',
          key: 'fechaRegistroDoc',
        },
        {
          title: 'Número de personas',
          dataIndex: 'colaboradoresNominas',
          key: 'colaboradoresNominas',
          render: (text, record, index) => {
            return record?.colaboradoresNominas?.length
          }
        },
        {
          title: 'Total de la nómina',
          dataIndex: 'totalNomina',
          key: 'totalNomina',
          render: (text, record, index) => {
            const totalNomina = (record?.colaboradoresNominas || []).reduce((a: any, cv: any) => a + Number(cv.dataFormNomina.total), 0);
            return NumberFormatUSD(totalNomina);
          }
        },
        {
          title: 'Responsable',
          dataIndex: 'usuarioResponsable',
          key: 'usuarioResponsable',
        },
        {
          title: 'Estado',
          dataIndex: 'estatus',
          key: 'estatus',
          render: (text, record, index) => {
            return text == "Activa"
              ? <Tag color="success">{text}</Tag>
              : <Tag color="processing">{text}</Tag>
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


  return (
    <>
      <Table
        loading={loadingTable}
        bordered
        columns={columns}
        dataSource={listaDeNominas}
        scroll={{
          x: 768,
        }} size="small" />

      <Drawer
        title={/* false ? 'Editar nómina' :  */'Nueva nómina'}
        width={768}
        onClose={() => dispatch(setOpenDrawerNomina(false))}
        open={openDrawerNomina}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: /* false ? "orange" :  */"rgba(5, 5, 5, 0.06)"
          }
        }}>
        <TableTemporal showAction={false} />
      </Drawer>
    </>

  )
}

export default TableNominas;

