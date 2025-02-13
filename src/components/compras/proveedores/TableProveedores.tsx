"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Dropdown, Flex, MenuProps, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FormOutlined
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { setOpenDrawer, setPerfilProveedores, setLoadingTable, setRefresh } from '@/features/ventasSlice';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { useRouter } from 'next/navigation';
import SkeletonProveedores from './SkeletonProveedores';
import { setAddressMultiple, setDirecciones } from '@/features/configuracionSlice';
import GoogleAddress from '@/components/GoogleAddress';

const { Title } = Typography;


const TableProveedores = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const { auth } = useSelector((state: any) => state.configuracion);

  const {
    loadingTable,
    listaDeProveedores = [],
  } = useSelector((state: any) => state.ventas);

  // 1. Función para eliminar record
  const eliminarProveedor = async (record: any) => {
    try {

      const proveedor = { ...record };

      dispatch(setLoadingTable(true));
      // Llamada a Firebase para crear el nuevo artículo
      const result = await FireStoreVentas.eliminarProveedor(auth?.empresa?.id, proveedor?.id);
      if (result) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Proveedor desactivado con éxito!`,
          showConfirmButton: false,
          timer: 3000,
        });
        dispatch(setRefresh(Math.random()));
      }

    } catch (error) {
      console.error("Error desactivando proveedor:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo desactivar proveedor",
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

          form.setFieldsValue({
            ...record
          });

          dispatch(setPerfilProveedores({
            ...record
          }));
          dispatch(setOpenDrawer(true));

          const idAddress = uuidv4();
          dispatch(setAddressMultiple([]));
          dispatch(setDirecciones([]));
          setTimeout(() => {
            dispatch(setDirecciones([{ id: idAddress, element: <GoogleAddress id={idAddress} /> }]));
          }, 400);
        }}>Editar proveedor</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setPerfilProveedores({ ...record, fechaRegistro: "" }));
          router.push(`/compras/proveedores/${record?.id}`);
        }}>Ver detalle proveedor</a>
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
          Swal.fire({
            title: "Seguro de desactivar proveedor?",
            text: "",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then((result) => {
            if (result.isConfirmed) {
              eliminarProveedor(record);
            }
          });

        }}>Desactivar proveedor</a>
      ),
      icon: <DeleteOutlined />,
      danger: true
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Title level={5}>{`Lista de proveedores, ${listaDeProveedores.length} resultados`}</Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'Fecha de Registro',
          dataIndex: 'fechaRegistroDoc',
          key: 'fechaRegistroDoc',
        },
        {
          title: 'Nombre',
          dataIndex: 'nombreProveedor',
          key: 'nombreProveedor',
        },
        {
          title: 'Contacto',
          dataIndex: 'nombreContacto',
          key: 'nombreContacto',
        },
        {
          title: 'Tipo Industria',
          dataIndex: 'tipoIndustria',
          key: 'tipoIndsutria',
        },
        {
          title: 'Tipo de Producto',
          dataIndex: 'tipoProducto',
          key: 'tipoProducto',
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
    return <SkeletonProveedores />
  } */

  return (
    <Table
      loading={loadingTable}
      bordered
      columns={columns}
      // dataSource={ [] }
      dataSource={listaDeProveedores}
      scroll={{
        x: 768,
      }} size="small" />
  )
}

export default TableProveedores;