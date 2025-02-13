"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';

import { Avatar, Button, Drawer, Dropdown, Form, Modal, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  MoreOutlined,
  FormOutlined,
  CheckSquareOutlined,
  CheckOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { setOpenDrawer, setPageListaDeUsuarios, setPerfilUsuario, setLoadingTable, setRefresh, setColaboradoresSeleccionados, setOpenModalAdicionales, setOpenModalIncapacidades } from '@/features/recursosHumanosSlice';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useCrearCuentaMutation } from '@/services/recursosHumanosApi';
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import { setListaDeSucursales, setDetalleDeSucursal } from "@/features/configuracionSlice";
import { enviarEmail } from '@/helpers/email';
import { generateRandomAlphanumeric } from '@/helpers/functions';
import SkeletonNominas from './SkeletonNominas';
import FormNominas from './FormNominas';
import FormAdicionalesNominas from './FormAdicionalesNominas';
import FormIncapacidadesNominas from './FormIncapacidadesNominas';
import Draggable from 'react-draggable';

dayjs.extend(customParseFormat);

const TableColaboradoresNominas = ({ form }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const [formNomina] = Form.useForm();
  // const [collaborator, setCollaborator] = React.useState({});
  const draggleRef = React.useRef<HTMLDivElement>(null);

  const [loading, setLoading] = React.useState(false);
  const {
    auth,
    refresh,
    listaDeSucursales,
    openDrawerNomina
  } = useSelector((state: any) => state.configuracion);

  const [crearCuenta, { data, isLoading, error }] = useCrearCuentaMutation();

  const {
    loadingTable,
    listaDeUsuarios = [],
    countListaDeUsuarios,
    pageListaDeUsuarios,
    detalleDeNomina,
    colaboradoresSeleccionados,
    openModalAdicionales,
    openModalIncapacidades,
  } = useSelector((state: any) => state.recursosHumanos);
  console.log("colaboradoresSeleccionados", colaboradoresSeleccionados)

  // Lista de sucursales (bodegas)
  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreConfiguracion.listarSucursales({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeSucursales: any) => {
        dispatch(setListaDeSucursales(listaDeSucursales));
      });
    }
  }, [auth, refresh]);

  // HANDLER MODAL
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    // setCollaborator({});
    setIsModalOpen(false);
  };

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de colaboradores, ${listaDeUsuarios.length} resultados`}</Typography.Title>,
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
          title: 'Nombres',
          dataIndex: 'nombres',
          key: 'nombres',
          render: (text, record, index) => {
            return record?.photoURL
              ? (
                <div>
                  {/* <Avatar src={<img src={record?.photoURL} alt="avatar" />} /> */}
                  <span>{`${record?.nombres} ${record?.apellidos}`}</span>
                </div>
              )
              : (
                <div>
                  {/* <Avatar icon={<UserOutlined />} /> */}
                  <span>{`${record?.nombres} ${record?.apellidos}`}</span>
                </div>
              )
          },
        },
        {
          title: 'Rol',
          dataIndex: 'puesto',
          key: 'puesto',
        },
        {
          title: 'Sucursal',
          dataIndex: 'sucursal',
          key: 'sucursal',
          render: (text, record, index) => {
            return <div>{listaDeSucursales.find((sucursal: any) => (sucursal?.id == text))?.nombre || text}</div>
          }
        },
        {
          title: 'Salario base',
          dataIndex: 'salarioBase',
          key: 'salarioBase',
        },
        {
          title: 'Estatus',
          dataIndex: 'estatusActual',
          key: 'estatusActual',
          render: (text, record, index) => {
            return text == "Activo"
              ? <Tag color="success">{text}</Tag>
              : <Tag color="processing">{text}</Tag>
          },
        },
        {
          title: '',
          align: 'center',
          width: 50,
          render: (_, record) => {
            const findColaboradorInArray = colaboradoresSeleccionados.find((colaborador: any) => (colaborador?.id == record?.id));
            return (
              <Button icon={findColaboradorInArray ? <CheckOutlined /> : <PlusOutlined />} onClick={() => {

                showModal();
                const { fechaRegistro, ...dataColaborador } = record;

                formNomina.resetFields();
                formNomina.setFieldValue("id", record?.id);


                if (findColaboradorInArray) {
                  for (const key in findColaboradorInArray?.dataFormNomina) {
                    formNomina.setFieldValue(key, findColaboradorInArray?.dataFormNomina[key]);
                  }
                  setTimeout(() => {
                    formNomina.setFieldValue("incapacidades", findColaboradorInArray?.dataFormNomina?.incapacidades);
                  }, 800);
                } else {
                  dispatch(setColaboradoresSeleccionados([
                    ...colaboradoresSeleccionados,
                    { ...dataColaborador, dataFormNomina: null }
                  ]));
                }

              }} color={findColaboradorInArray ? "primary" : "default"} variant="dashed">
                {findColaboradorInArray ? "Agregado" : "Agregar"}
              </Button>
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
        dataSource={listaDeUsuarios}
        scroll={{
          x: 768,
        }}
        pagination={{
          current: pageListaDeUsuarios, // Controlas la página actual con esta propiedad
          pageSize: 10, // Puedes ajustar el tamaño de la página según lo necesites
          total: countListaDeUsuarios, // Total de elementos para mostrar en la paginación
          // showTotal: (total) => `Total ${total}`,
        }}
        onChange={((pagination: any) => {
          console.log('pagination', pagination)
          dispatch(setPageListaDeUsuarios(pagination?.current));
        })}
        rowClassName={(record, index) => {
          // Cambia el color de las filas según la lógica
          return colaboradoresSeleccionados.find((colaborador: any) => (colaborador?.id == record?.id)) ? 'row-active' : '';
        }}
        size="small" />

      <Modal
        maskClosable={false}
        title="Agregar a nómina"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          handleCancel();
          const filterColaboradoresSeleccionados = colaboradoresSeleccionados
            .filter((colaborador: any) => (colaborador?.dataFormNomina));

          dispatch(setColaboradoresSeleccionados(filterColaboradoresSeleccionados));
        }}
        /* modalRender={(modal) => (
          <Draggable
            nodeRef={draggleRef}
            handle=".ant-modal-header"
            bounds={{
              left: -(window.innerWidth / 2),  // Límite hacia la izquierda
              top: -(window.innerHeight / 2),    // Límite hacia arriba
              right: (window.innerWidth / 2),  // Límite hacia la derecha
              bottom: window.innerHeight / 2,  // Límite hacia abajo
            }}
          >
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )} */
        footer={null}>
        {isModalOpen && <FormNominas
          form={formNomina}
          // collaborator={collaborator}
          handleCancel={handleCancel}
        />}
      </Modal>


    </>

  )
}

export default TableColaboradoresNominas;