"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonSucursales from './SkeletonSucursales';
import { Button, Dropdown, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  DeleteOutlined,
  MoreOutlined,
  FormOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { setOpenDrawer, setDetalleDeSucursal, setLoadingTable, setRefresh } from '@/features/configuracionSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);


const TableSucursales = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    auth,
    loadingTable,
    listaDeSucursales = [],
  } = useSelector((state: any) => state.configuracion);

  // 1. Función para eliminar record
  const eliminarSucursal = async (record: any) => {
    try {
      
      const bodega = { ...record };

      dispatch(setLoadingTable(true));
      
      const result = await FireStoreConfiguracion.eliminarSucursal(auth?.empresa?.id, bodega?.id);
      if (result) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Bodega eliminado con éxito!`,
          showConfirmButton: false,
          timer: 3000,
        });
        dispatch(setRefresh(Math.random()));
      }
      
    } catch (error) {
      console.error("Error eliminando bodega:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar bodega",
        icon: "error",
      });
    }
  };

  const getMenuItems = (record: any): any[] => [
    {
      key: '1',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          form.resetFields();

          const {
            populateEncargado,
            horarios,
            ...others
          } = record;

          form.setFieldsValue({
            ...others,
            horarios: horarios.map((horario: any) => ({
              ...horario,
              inicio: dayjs(horario.inicio,'HH:mm:ss'),
              fin: dayjs(horario.fin,'HH:mm:ss'),
            })),
          });
          dispatch(setDetalleDeSucursal({
            ...others,
            horarios: horarios.map((horario: any) => ({
              ...horario,
              inicio: dayjs(horario.inicio,'HH:mm:ss'),
              fin: dayjs(horario.fin,'HH:mm:ss'),
            })),
          }));
          dispatch(setOpenDrawer(true));
        }}>Editar bodega</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          router.push(`/inventario/bodegas/${record?.id}/articulos/`);
        }}>Ver articulos</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          // Llamada a la función de eliminación
          Swal.fire({
            title: "Seguro de eliminar bodega?",
            text: "",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then((result) => {
            if (result.isConfirmed) {
              eliminarSucursal(record);
            }
          });

        }}>Eliminar bodega</a>
      ),
      icon: <DeleteOutlined />,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de bodegas, ${listaDeSucursales.length} resultados`}</Typography.Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        // {
        //   title: 'N°',
        //   dataIndex: 'numero',
        //   key: 'numero',
        //   width: 50,
        //   render: (text, record, index) => <div>{(index + 1)}</div>,
        // },
        {
          title: 'Nombre',
          dataIndex: 'nombre',
          key: 'nombre',

        },
        {
          title: 'Dirección',
          dataIndex: 'direccion',
          key: 'direccion',
        },
        {
          title: 'Tipo',
          dataIndex: 'tipoSucursal',
          key: 'tipoSucursal',
        },
        {
          title: 'Nombre encargado',
          dataIndex: 'encargado',
          key: 'encargado',
          render: (text, record, index) => ( record?.populateEncargado ? `${record?.populateEncargado?.nombres} ${record?.populateEncargado?.apellidos}` : "Sin encargado" ),
        },
        {
          title: 'Estado',
          dataIndex: 'estadoDeOperacion',
          key: 'estadoDeOperacion',
          render: (text, record, index) => {
            return text
              ? <Tag color="success">Activo</Tag>
              : <Tag color="processing">Inactivo</Tag>
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
    return <SkeletonSucursales />
  }

  return (
    <Table
      bordered
      columns={columns}
      dataSource={listaDeSucursales}
      scroll={{
        x: 768,
      }} size="small" />
  )
}

export default TableSucursales;