"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Dropdown, Flex, Form, MenuProps, Modal, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FormOutlined
} from '@ant-design/icons';
import { setOpenDrawerArticulo, setDetalleArticulos, setLoadingTable } from '@/features/inventarioSlice';
import { useParams, useRouter } from 'next/navigation';

import FireStoreInventario from '@/firebase/FireStoreInventario';
import SkeletonListaDePrecios from './SkeletonListaDePrecios';
import { NumberFormatMXN } from '@/helpers/functions';
import FormInformacionDelArticulo from './FormInformacionDelArticulo';
import { setArticuloTemporal, setModalInformacionDelArticulo, setUpdateArticulo, setRefresh } from '@/features/ventasSlice';
import FireStoreVentas from '@/firebase/FireStoreVentas';



const TableDetalleListaDePrecios = ({ form }: any) => {

  const dispatch = useDispatch();
  const [formInformacionDelArticulo] = Form.useForm();
  // const { idLista } = useParams();



  const {
    loadingTable,
    listaDeArticulos = [],
    subCollectionEmpresa,
    detalleCatalogo
  } = useSelector((state: any) => state.inventario);

  const { auth } = useSelector((state: any) => state.configuracion);
  const {
    listaDeProveedores = [],
    detalleDeListaDePrecios,
    articulosDetalleListaDePrecios = [],
    modalInformacionDelArticulo,
    articuloTemporal,
    updateArticulo
  } = useSelector((state: any) => state.ventas);
  const { listaDeSucursales } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    if (articuloTemporal && updateArticulo) {

      const articulosMap = (detalleDeListaDePrecios?.articulos || [])?.map((articulo: any) => {
        return {
          ...articulo,
          informacionDelArticulo: (articuloTemporal?.id === articulo?.id)
            ? articuloTemporal?.informacionDelArticulo
            : articulo?.informacionDelArticulo
        }
      });

      FireStoreVentas.registrarListaDePrecios(auth?.empresa?.id, {
        id: detalleDeListaDePrecios?.id,
        articulos: articulosMap
      }).then(() => {
        dispatch(setArticuloTemporal(null));
        dispatch(setUpdateArticulo(false));
        dispatch(setRefresh(Math.random()));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Artículo actualizado con éxito!`,
          showConfirmButton: false,
          timer: 2000,
        });

      });
    }

  }, [articuloTemporal]);

  // 1. Función para duplicar el artículo en Firebase
  const duplicarArticulo = async (record: any) => {
    try {
      // Modifica el objeto para asignarle un nuevo ID (Firebase lo puede generar automáticamente)
      const nuevoArticulo = { ...record };
      delete nuevoArticulo.id; // eliminamos el ID existente

      dispatch(setLoadingTable(true));
      // Llamada a Firebase para crear el nuevo artículo
      await FireStoreInventario.registrarArticulos(auth?.empresa?.id, { ...nuevoArticulo });

      // Muestra mensaje de éxito
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Artículo duplicado con éxito!`,
        showConfirmButton: false,
        timer: 3000,
      });

      // Refresca la tabla llamando al setRefresh o una acción similar
      dispatch(setRefresh(Math.random()));
    } catch (error) {
      console.error("Error duplicando el artículo:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo duplicar el artículo",
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
          const { fechaRegistro, ...data } = record;

          formInformacionDelArticulo.resetFields();

          formInformacionDelArticulo.setFieldsValue({
            id: "editar",
            ...data?.informacionDelArticulo
          });

          dispatch(setArticuloTemporal({
            ...data
          }));
          dispatch(setUpdateArticulo(false));
          dispatch(setModalInformacionDelArticulo(true));

        }}>Editar artículo</a>
      ),
      icon: <FormOutlined />,
    },
    /* {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          // Llamada a la función de duplicación
          duplicarArticulo(record);

        }}>Duplicar artículo</a>
      ),
      icon: <EyeOutlined />,
    }, */
    {
      type: 'divider',
    },
    {
      key: '3',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            title: "Seguro de eliminar articulo?",
            text: record?.descripcion || "",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1677ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No"
          }).then(async (result) => {
            if (result.isConfirmed) {

              const articulosFilter = (detalleDeListaDePrecios?.articulos || [])?.filter((articulo: any) => (record?.id != articulo?.id));

              await FireStoreVentas.registrarListaDePrecios(auth?.empresa?.id, {
                id: detalleDeListaDePrecios?.id,
                articulos: articulosFilter
              });
              dispatch(setArticuloTemporal(null));
              dispatch(setUpdateArticulo(false));
              dispatch(setRefresh(Math.random()));

              Swal.fire({
                title: "Artículo eliminado!",
                text: "",
                icon: "success"
              });

            }
          });

        }}>Eliminar articulo</a>
      ),
      icon: <DeleteOutlined />,
      danger: true
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de articulos, ${articulosDetalleListaDePrecios?.length} resultados`}</Typography.Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'Código',
          dataIndex: 'codigoArticulo',
          key: 'codigoArticulo',
        },
        {
          title: 'Nombre',
          dataIndex: 'descripcion',
          key: 'descripcion',
          // dataIndex: 'nombreArticulo',
          // key: 'nombreArticulo',
        },
        {
          title: 'Precio',
          dataIndex: 'informacionDelArticulo',
          key: 'informacionDelArticulo',
          align: 'center',
          render: (text, record, index) => {
            return <div>{NumberFormatMXN(record?.informacionDelArticulo?.precioDeVenta || "")}</div>
          }
        },
        {
          title: 'Descuento',
          dataIndex: 'informacionDelArticulo',
          key: 'informacionDelArticulo',
          align: 'center',
          render: (text, record, index) => {
            return <div>{(record?.informacionDelArticulo?.descuento || "0") + "%"}</div>
          }
        },
        {
          title: 'Descuento maximo',
          dataIndex: 'informacionDelArticulo',
          key: 'informacionDelArticulo',
          align: 'center',
          render: (text, record, index) => {
            return <div>{(record?.informacionDelArticulo?.descuentoMaximo || "0") + "%"}</div>
          }
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
    <>
      <Table
        bordered
        columns={columns}
        // dataSource={ [] }
        dataSource={articulosDetalleListaDePrecios}
        scroll={{
          x: 768,
        }} size="small" />
      <Modal
        title={`Detalles del artículo`}
        open={modalInformacionDelArticulo}
        maskClosable={false} // Evita el cierre al hacer clic fuera del modal
        footer={null} // Oculta los botones de "Cancelar" y "OK"
        onCancel={() => dispatch(setModalInformacionDelArticulo(false))}
      >
        <FormInformacionDelArticulo form={formInformacionDelArticulo} />
      </Modal>
    </>

  )
}

export default TableDetalleListaDePrecios;