"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Dropdown, Flex, MenuProps, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FormOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { setOpenDrawer, setDetalleCatalogos, setRefresh, setLoadingTable } from '@/features/inventarioSlice';
import { useRouter } from 'next/navigation';
import SkeletonCatalogos from './SkeletonCatalogos';

import FireStoreInventario from '@/firebase/FireStoreInventario';


const TableCatalogos = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);

  const {
    loadingTable,
    listaDeCatalogos = [],
  } = useSelector((state: any) => state.inventario);
  const { auth } = useSelector((state: any) => state.configuracion);

  const {
    listaDeClientes = [],
  } = useSelector((state: any) => state.ventas);

  // 1. Función para duplicar el artículo en Firebase
  const duplicarCatalogo = async ({ id, ...data }: any) => {
    try {
      setLoading(true);
      const [fechaRegistro] = new Date().toISOString().split('T');
      // Llamada a Firebase para crear el nuevo artículo
      await FireStoreInventario.registrarCatalogo(auth?.empresa?.id, {
        ...data,
        nombreCatalogo: `${data?.nombreCatalogo || ""} - copia`,
        fechaRegistroDoc: fechaRegistro,
        isCopia: true
      });

      // Muestra mensaje de éxito
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: 'Catálogo duplicado con éxito!',
        showConfirmButton: false,
        timer: 3000,
      });

      // Refresca la tabla llamando al setRefresh o una acción similar
      dispatch(setRefresh(Math.random()));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error duplicando el catálogo:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo duplicar el catálogo",
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
          dispatch(setDetalleCatalogos(record));
          router.push(`/inventario/catalogos/${record?.id}`);
        }}>Ver artículos</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          // Llamada a la función de duplicación
          duplicarCatalogo(record);

        }}>Duplicar catálogo</a>
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
            title: "Seguro de desactivar catálogo?",
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

        }}>Desactivar catálogo</a>
      ),
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de catálogos, ${listaDeCatalogos.length} resultados`}</Typography.Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'Código',
          dataIndex: 'codigoCatalogo',
          key: 'codigoCatalogo',
        },
        {
          title: 'Nombre',
          dataIndex: 'nombreCatalogo',
          key: 'nombreCatalogo',
        },
        {
          title: 'Cliente',
          dataIndex: 'cliente',
          key: 'cliente',
          render: (text, record, index) => {
            const cliente =
              listaDeClientes.find((cliente: any) => cliente?.id == text)
                ?.nombreCliente || "---";
            return <div>{cliente}</div>;
          }
        },
        {
          title: 'Número de artículos',
          dataIndex: 'articulos',
          key: 'articulos',
          render: (text, record, index) => <div>{(record?.articulos || []).length}</div>,
        },
        {
          title: 'Fecha de registro',
          dataIndex: 'fechaRegistroDoc',
          key: 'fechaRegistroDoc',
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
                  <Button loading={loading} shape="circle" icon={<MoreOutlined />} />
                </Tooltip>
              </Dropdown>
            )
          },
        },
      ],
    },

  ];

  /* if (loadingTable) {
    return <SkeletonCatalogos />
  } */

  return (
    <Table
      loading={loadingTable}
      bordered
      columns={columns}
      // dataSource={ [] }
      dataSource={listaDeCatalogos}
      scroll={{
        x: 768,
      }} size="small" />
  )
}

export default TableCatalogos;