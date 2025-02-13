"use client";
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FormOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { setDetalleDeUnidad, setLoadingTable, setOpenDrawerUnidad, setRefresh } from '@/features/finanzasSlice';
import SkeletonUnidades from './SkeletonUnidades';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { UnidadStatus, UnidadStatusColor } from '@/types/unidades';
import DetallesRuta from './DetallesRuta';
import { useRouter } from 'next/navigation';
dayjs.extend(customParseFormat);

const TableUnidades = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    loadingTable,
    listaDeUnidades = [],
    listaDeRutas,
    subCollectionEmpresa = {}
  } = useSelector((state: any) => state.finanzas);

  console.log("Estado actual:", {
    tiposVehiculos: subCollectionEmpresa?.tipoVehiculos,
    unidades: listaDeUnidades
  });

  const {
    listaDeProveedores = [],
  } = useSelector((state: any) => state.ventas);

  const {
    listaDeSucursales = [],
  } = useSelector((state: any) => state.configuracion);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const [loadingLocal, setLoadingLocal] = React.useState(false);
  const [isDetallesRutaOpen, setIsDetallesRutaOpen] = React.useState(false);
  const [selectedRuta, setSelectedRuta] = React.useState(null);

  // Cargar tipos de vehículos
  React.useEffect(() => {
    if (auth?.empresa?.id) {
      FireStoreFinanzas.listarSubCollectionEmpresa(auth.empresa.id, "tipoVehiculos")
        .then((data: any) => {
          dispatch({ type: 'finanzas/setSubCollectionEmpresa', payload: { tipoVehiculos: data } });
        });
    }
  }, [auth?.empresa?.id, dispatch]);

  const getRutaLabel = (rutaId: string) => {
    const ruta = listaDeRutas.find((r: any) => r.id === rutaId);
    if (!ruta) return "";

    if (ruta.tipoDeRuta === "Proveedor") {
      const proveedor = listaDeProveedores.find((p: any) => p.id === ruta.proveedor);
      return `${ruta.tipoDeRuta} - ${proveedor?.nombreProveedor || ''}`;
    } else if (ruta.tipoDeRuta === "Automática") {
      const sucursal = listaDeSucursales.find((s: any) => s.id === ruta.sucursal);
      return `${ruta.tipoDeRuta} - ${sucursal?.nombre || ''}`;
    }
    return ruta.tipoDeRuta;
  };

  // 1. Función para eliminar record
  const eliminarUnidad = async (record: any) => {
    try {

      const unidad = { ...record };
      console.log("Unidad: ", unidad);

      dispatch(setLoadingTable(true));

      const result = await FireStoreFinanzas.eliminarUnidad(auth?.empresa?.id, unidad?.id);
      if (result) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Unidad eliminado con éxito!`,
          showConfirmButton: false,
          timer: 3000,
        });
        dispatch(setRefresh(Math.random()));
      }

    } catch (error) {
      console.error("Error eliminando unidad:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar unidad",
        icon: "error",
      });
    }
  };

  const getMenuItems = (record: any): any[] => [
    {
      key: '0',
      label: <a 
        onClick={() => router.push(`/logistica/unidades/${record?.id}/articulos/`)}
      >Ver articulos</a>,
      icon:<EyeOutlined />
    },
    {
      key: '1',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          form.resetFields();
          const {
            fechaMantenimiento,
            ...others
          } = record;

          form.setFieldsValue({
            ...others,
            fechaMantenimiento: fechaMantenimiento ? dayjs(fechaMantenimiento, 'YYYY-MM-DD') : "",
          });
          dispatch(setDetalleDeUnidad(record));
          dispatch(setOpenDrawerUnidad(true));
        }}>Editar Unidad</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          // TODO: Implement assign driver functionality
        }}>Asignar Chofer</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '3',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          // TODO: Implement assign route functionality
        }}>Asignar Ruta</a>
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
          // TODO: Implement status change functionality
        }}>Modificar Estatus</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '5',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          setSelectedRuta(record);
          setIsDetallesRutaOpen(true);
        }}>Ver Detalles de la Ruta</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '6',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            title: "¿Seguro de eliminar la unidad?",
            text: "",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then((result) => {
            if (result.isConfirmed) {
              eliminarUnidad(record);
            }
          });
        }}>Eliminar Unidad</a>
      ),
      icon: <DeleteOutlined />,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de Unidades, ${listaDeUnidades.length} resultados`}</Typography.Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'ID Unidad',
          dataIndex: 'idUnidad',
          key: 'idUnidad',
        },
        {
          title: 'Chofer Asignado',
          dataIndex: 'nombreChofer',
          key: 'nombreChofer',
        },
        {
          title: 'Placas',
          dataIndex: 'placas',
          key: 'placas',
        },
        {
          title: 'Tipo de Vehiculo',
          dataIndex: 'tipoVehiculo',
          key: 'tipoVehiculo',
          render: (tipoVehiculoId) => {
            const tipoVehiculo = subCollectionEmpresa?.tipoVehiculos?.find(
              (tipo: any) => tipo.id === tipoVehiculoId
            );
            return tipoVehiculo?.nombre || 'No especificado';
          },
        },
        {
          title: 'Marca y Modelo',
          dataIndex: 'marcaModelo',
          key: 'marcaModelo',
          render: (_, record) => `${record.marca} - ${record.modelo}`,
        },
        {
          title: 'Año de Fabricacion',
          dataIndex: 'anioFabricacion',
          key: 'anioFabricacion',
        },
        {
          title: 'Ruta Asignada',
          dataIndex: 'rutaAsignada',
          key: 'rutaAsignada',
          render: (text) => getRutaLabel(text),
        },
        {
          title: 'Estatus',
          dataIndex: 'status',
          key: 'status',
          render: (text: UnidadStatus) => (
            <Tag color={UnidadStatusColor[text] || 'default'}>{text}</Tag>
          )
        },
        {
          title: '',
          align: 'center',
          width: 50,
          render: (_, record) => (
            <Dropdown menu={{
              items: getMenuItems(record)
            }} placement="bottomRight" trigger={['click']}>
              <Tooltip title="Acciones">
                <Button loading={loadingLocal} shape="circle" icon={<MoreOutlined />} />
              </Tooltip>
            </Dropdown>
          ),
        },
      ],
    },
  ];

  if (loadingTable) {
    return <SkeletonUnidades />;
  }

  return (
    <>
      <div style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={listaDeUnidades}
          rowKey="id"
          pagination={{
            total: listaDeUnidades.length,
            pageSize: 10,
            showTotal: (total) => `Total ${total} items`,
          }}
          scroll={{
            x: 768,
          }} size="small" />
      </div>
      <DetallesRuta
        isOpen={isDetallesRutaOpen}
        onClose={() => setIsDetallesRutaOpen(false)}
        rutaData={selectedRuta}
      />
    </>
  );
};

export default TableUnidades;