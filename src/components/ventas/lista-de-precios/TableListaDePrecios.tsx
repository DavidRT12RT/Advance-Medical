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
import { v4 as uuidv4 } from 'uuid';
import { setOpenDrawer, setPerfilClientes, setLoadingTable, setRefresh, setOpenDrawerListaDePrecios, setDetalleDeListaDePrecios } from '@/features/ventasSlice';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { useRouter } from 'next/navigation';
import { setAddressMultiple, setDirecciones } from '@/features/configuracionSlice';
import GoogleAddress from '@/components/GoogleAddress';
import SkeletonListaDePrecios from './SkeletonListaDePrecios';

const { Title } = Typography;


const TableListaDePrecios = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const { auth } = useSelector((state: any) => state.configuracion);

  const {
    loadingTable,
    listaDeClientes = [],
    listaDeListaDePrecios = [],
  } = useSelector((state: any) => state.ventas);
  console.log('listaDeClientes', listaDeClientes)

  // 1. Función para eliminar record
  const eliminarCliente = async (record: any) => {
    try {

      const cliente = { ...record };

      dispatch(setLoadingTable(true));
      // Llamada a Firebase para crear el nuevo artículo
      const result = await FireStoreVentas.eliminarCliente(auth?.empresa?.id, cliente?.id);
      if (result) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Cliente desactivado con éxito!`,
          showConfirmButton: false,
          timer: 3000,
        });
        dispatch(setRefresh(Math.random()));
      }

    } catch (error) {
      console.error("Error desactivando cliente:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo desactivar cliente",
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
            ...record, fechaRegistro: ""
          });

          dispatch(setDetalleDeListaDePrecios({
            ...record, fechaRegistro: ""
          }));
          dispatch(setOpenDrawerListaDePrecios(true));

        }}>Editar lista de precios</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setDetalleDeListaDePrecios({ ...record, fechaRegistro: "" }));
          router.push(`/ventas/lista-de-precios/${record?.id}`);
        }}>Ver detalle de la lista</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '3',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          const { id, fechaRegistro, ...data } = record;

          form.resetFields();

          form.setFieldsValue({
            ...data,
            nombreDeLaListaDePrecios: `${data?.nombreDeLaListaDePrecios} - copia`,
          });

          dispatch(setDetalleDeListaDePrecios({
            ...data,
            nombreDeLaListaDePrecios: `${data?.nombreDeLaListaDePrecios} - copia`,
          }));
          dispatch(setOpenDrawerListaDePrecios(true));

        }}>Duplicar lista de precios</a>
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
            title: "Seguro de eliminar lista de precios?",
            text: record?.nombreDeLaListaDePrecios,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then((result) => {
            if (result.isConfirmed) {
              // eliminarCliente(record)
              FireStoreVentas.eliminarListaDePrecios(auth?.empresa?.id, record?.id)
                .then(() => {
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: `Lista de precios eliminada con éxito!`,
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  dispatch(setRefresh(Math.random()));
                })
                .catch((error) => {
                  console.error("Error eliminando lista de precios:", error);
                  Swal.fire({
                    title: "Error",
                    text: "No se pudo eliminar lista de precios",
                    icon: "error",
                  });
                });
            }
          });

        }}>Eliminar lista de precios</a>
      ),
      icon: <DeleteOutlined />,
      danger: true
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Title level={5}>{`Lista de precios, ${listaDeListaDePrecios.length} resultados`}</Title>,
      dataIndex: 'listaDePrecios',
      key: 'listaDePrecios',
      children: [
        {
          title: 'Código',
          dataIndex: 'codigoDeLaListaDePrecios',
          key: 'codigoDeLaListaDePrecios',
        },
        {
          title: 'Nombre de la lista',
          dataIndex: 'nombreDeLaListaDePrecios',
          key: 'nombreDeLaListaDePrecios',
        },
        {
          title: 'Número de artículos',
          dataIndex: 'articulos',
          key: 'articulos',
          render: (text, record, index) => (<div>{record?.articulos?.length}</div>),
        },
        {
          title: 'Clientes asignados',
          dataIndex: 'clientes',
          key: 'clientes',
          render: (text, record, index) => {

            const clientesMap = (record?.clientes || []).map((idCliente: any) => {
              const findCliente = listaDeClientes.find((cliente: any) => cliente.id === idCliente);
              return findCliente ? findCliente?.nombreCliente : 'Desconocido';
            });

            return (
              <div>
                {clientesMap.join(", ")}
              </div>
            )
          },
        },
        {
          title: 'Fecha de registro',
          dataIndex: 'fechaRegistroDoc',
          key: 'fechaRegistroDoc',
        },
        {
          title: 'Estatus',
          dataIndex: 'estatus',
          key: 'estatus',
          render: (text, record, index) => {
            return record?.estatus
              ? <Tag color="success">Activa</Tag>
              : <Tag color="processing">Inactiva</Tag>
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
    return <SkeletonListaDePrecios />
  }

  return (
    <Table
      bordered
      columns={columns}
      dataSource={listaDeListaDePrecios}
      scroll={{
        x: 768,
      }} size="small" />
  )
}

export default TableListaDePrecios;