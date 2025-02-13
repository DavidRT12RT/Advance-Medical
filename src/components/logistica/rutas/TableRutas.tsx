"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, message, Modal, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  FormOutlined,
  MoreOutlined,
  CopyOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import GeofenceMap from './GeofenceMap';
import SkeletonRutas from './SkeletonRutas';
import { setDetalleDeRuta, setOpenDrawerRutas, setRefresh } from '@/features/finanzasSlice';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';

dayjs.extend(customParseFormat);



const TableRutas = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const [loadingLocal, setLoadingLocal] = React.useState(false);
  const [geofenceCoordinates, setGeofenceCoordinates] = React.useState<{ lat: number; lng: number }[]>([]);

  const {
    loadingTable,
    listaDeRutas = [],
  } = useSelector((state: any) => state.finanzas);

  const {
    listaDeUsuarios = {},
  } = useSelector((state: any) => state.recursosHumanos);
  const {
    auth,
  } = useSelector((state: any) => state.configuracion);


  const getMenuItems = (record: any): any[] => [
    {
      key: '1',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          form.resetFields();

          form.setFieldsValue({
            ...record,
            horaDeSalida: dayjs(record.horaDeSalida, 'HH:mm:ss'),
            clientes: (record.clientes || []).map((p: any) => p.id),
          });

          dispatch(setDetalleDeRuta({
            ...record,
            horaDeSalida: dayjs(record.horaDeSalida, 'HH:mm:ss'),
            clientes: (record.clientes || []).map((p: any) => p.id),
          }));
          dispatch(setOpenDrawerRutas(true));
        }}>Editar ruta</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={async (e) => {
          e.preventDefault();
          try {
            const { id, ...data } = record;

            form.resetFields();

            form.setFieldsValue({
              ...data,
              nombreDeRuta: `${data?.nombreDeRuta} - copia`,
              horaDeSalida: dayjs(record.horaDeSalida, 'HH:mm:ss'),
              clientes: (data.clientes || []).map((p: any) => p.id),
            });

            dispatch(setDetalleDeRuta({
              ...data,
              nombreDeRuta: `${data?.nombreDeRuta} - copia`,
              horaDeSalida: dayjs(data.horaDeSalida, 'HH:mm:ss'),
              clientes: (data.clientes || []).map((p: any) => p.id),
            }));
            dispatch(setOpenDrawerRutas(true));
          } catch (error) {
            console.error("Error duplicando ruta:", error);
            Swal.fire({
              title: "Error",
              text: error?.toString(),
              icon: "error",
            });
          } finally {
            setLoadingLocal(false);
          }
        }}>Duplicar</a>
      ),
      icon: <CopyOutlined />,
    },
    {
      key: '3',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setDetalleDeRuta(record));
          router.push(`/logistica/rutas/${record?.id}`);
        }}>Ver detalle de ruta</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '4',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
        }}>Agregar artículos</a>
      ),
      icon: <PlusOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '5',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            title: "Seguro de eliminar ruta?",
            text: record?.nombreDeRuta,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then(async (result) => {
            if (result.isConfirmed) {
              setLoadingLocal(true);
              await FireStoreFinanzas.eliminarRuta(auth?.empresa?.id, record?.id);
              // Refresca la tabla llamando al setRefresh o una acción similar
              dispatch(setRefresh(Math.random()));
              setLoadingLocal(false);
              Swal.fire({
                title: "Ruta eliminada!",
                text: "",
                icon: "success"
              });
            }
          });
        }}>Eliminar ruta</a>
      ),
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de rutas, ${listaDeRutas.length} resultados`}</Typography.Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'Nombre de la ruta',
          dataIndex: 'nombreDeRuta',
          key: 'nombreDeRuta',
        },
        {
          title: 'Tipo de ruta',
          dataIndex: 'tipoDeRuta',
          key: 'tipoDeRuta',
        },
        {
          title: 'Chofer asignado',
          dataIndex: 'chofer',
          key: 'chofer',
          render: (text, record, index) => {
            const findChofer = listaDeUsuarios.find((usuario: any) => usuario?.id == text);
            return findChofer ? `${findChofer?.nombres} ${findChofer?.apellidos}` : "";
          },
        },
        {
          title: 'Día(s) de entrega',
          dataIndex: 'diasDeEntrega',
          key: 'diasDeEntrega',
          render: (text, record, index) => (<div>{record?.diasDeEntrega?.join(', ')}</div>)
        },
        {
          title: 'Frecuencia',
          dataIndex: 'frecuenciaDeEntrega',
          key: 'frecuenciaDeEntrega',
        },
        {
          title: 'Hora de salida',
          dataIndex: 'horaDeSalida',
          key: 'horaDeSalida',
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
                  <Button loading={loadingLocal} shape="circle" icon={<MoreOutlined />} />
                </Tooltip>
              </Dropdown>
            )
          },
        },
      ],
    },

  ];

  const [isModalOpen, setIsModalOpen] = React.useState(false);


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.setFieldsValue({ geofence: geofenceCoordinates });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleGeofenceComplete = (coordinates: { lat: number; lng: number }[]) => {
    setGeofenceCoordinates(coordinates);
    form.setFieldsValue({ geofence: coordinates });
  };

  /* if (loadingTable) {
    return <SkeletonRutas />
  } */

  return (
    <>
      <Table
        loading={loadingTable}
        bordered
        columns={columns}
        dataSource={listaDeRutas}
        scroll={{
          x: 768,
        }} size="small" />

      <Modal
        title={"Geofence Área Geográfica"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={768}
      >
        <GeofenceMap
          onGeofenceComplete={handleGeofenceComplete}
          initialCoordinates={geofenceCoordinates}
        />
      </Modal>
    </>

  )
}

export default TableRutas;