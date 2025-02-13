"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Form, Modal, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FormOutlined,
  CopyOutlined,
  SaveOutlined,
  AuditOutlined
} from '@ant-design/icons';

import { useRouter } from 'next/navigation';
import { setDetalleDeCompra, setOpenDrawer, setRefresh } from '@/features/finanzasSlice';
import SkeletonCompras from './SkeletonOrdenesEnTransito';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { NumberFormatUSD } from '@/helpers/functions';
import { CompraStatus, CompraStatusColor } from '@/types/compras';
import DynamicTableArticulosOrdenados from './DynamicTableArticulosOrdenados';
dayjs.extend(customParseFormat);




const TableOrdenesEnTransito = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    loadingTable,
    listaDeComprasEnTransito = [],
  } = useSelector((state: any) => state.finanzas);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    listaDeProveedores = []
  } = useSelector((state: any) => state.ventas);

  const [loadingLocal, setLoadingLocal] = React.useState(false);


  const getMenuItems = (record: any): any[] => [

    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setDetalleDeCompra({
            ...record,
          }));
          router.push(`/compras/compras/${record?.id}?cc=${record?.codigoCompra || ''}`);
        }}>Ver detalle</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '3',
      label: (
        <a onClick={async (e) => {
          e.preventDefault();
          dispatch(setDetalleDeCompra({
            ...record,
          }));
          showModal();
        }}>Registrar entrada</a>
      ),
      icon: <AuditOutlined />,
    },
    /* {
      type: 'divider',
    },
    {
      key: '4',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            title: "Seguro de eliminar compra?",
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

        }}>Eliminar compra</a>
      ),
      icon: <DeleteOutlined />,
    }, */
  ];


  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de ordenes en tránsito, ${listaDeComprasEnTransito.length} resultados`}</Typography.Title>,
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
          title: 'Código',
          dataIndex: 'codigoCompra',
          key: 'codigoCompra',
        },
        {
          title: 'Proveedor',
          dataIndex: 'proveedor',
          key: 'proveedor',
          render: (text, record, index) => {
            const proveedores = (record?.articulos || []).map((articulo: any) => {
              return articulo?.proveedor;
            });

            const proveedoresUnicos = new Set(proveedores);
            const proveedoresUnicosArray: any[] = Array.from(proveedoresUnicos);
            const proveedor = listaDeProveedores.filter((proveedor: any) => proveedoresUnicosArray.includes(proveedor?.id)).map((proveedor: any) => proveedor?.nombreProveedor);
            return (
              <div>{proveedor.join(', ')}</div>
            )
          },
        },
        {
          title: 'Guía de Rastreo',
          dataIndex: 'guiaDeRastreo',
          key: 'guiaDeRastreo',
          render: (text, record, index) => <div>{(text || []).map((guia: any) => guia).join(', ')}</div>,
        },
        {
          title: 'Fecha de compra',
          dataIndex: 'fechaDeCompra',
          key: 'fechaDeCompra',
        },
        {
          title: 'Fecha de llegada',
          dataIndex: 'fechaEstimadaDeLlegada',
          key: 'fechaEstimadaDeLlegada',
        },
        /* {
          title: 'N° de artículos',
          dataIndex: 'articulos',
          key: 'articulos',
          render: (text, record, index) => <div>{record?.articulos?.length}</div>,
        }, */
        {
          title: 'Total',
          dataIndex: 'totalDeLaCompra',
          key: 'totalDeLaCompra',
          render: (text, record, index) => <div>{NumberFormatUSD(Number(text))}</div>
        },
        {
          title: 'Estatus',
          dataIndex: 'estatus',
          key: 'estatus',
          render: (text: CompraStatus) => (
            <Tag color={CompraStatusColor[text] || 'default'}>{text}</Tag>
          )
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
                  <Button loading={loadingLocal} shape="circle" icon={<MoreOutlined />} />
                </Tooltip>
              </Dropdown>
            )
          },
        },
      ],
    },

  ];

  // HANDLER MODAL
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  if (loadingTable) {
    return <SkeletonCompras />
  }

  return (
    <>
      <Table
        bordered
        columns={columns}
        // dataSource={ [] }
        dataSource={listaDeComprasEnTransito}
        scroll={{
          x: 768,
        }} size="small" />
      <Modal
        // loading
        width={768}
        title="Registrar entrada"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Aplicar"
        cancelText="Cerrar"
        footer={null}>
        <DynamicTableArticulosOrdenados/>
      </Modal>
    </>
  )
}

export default TableOrdenesEnTransito;