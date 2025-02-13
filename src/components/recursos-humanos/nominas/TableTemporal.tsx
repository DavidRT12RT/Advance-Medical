"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonUsuarios from '../colaboradores/SkeletonColaboradores';
import { Button, Col, Divider, Dropdown, Flex, message, Row, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  FormOutlined,
  MoreOutlined,
  CopyOutlined,
  UndoOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { setColaboradoresSeleccionados, setDetalleDeContratacion, setOpenDrawer, setOpenDrawerNomina } from '@/features/recursosHumanosSlice';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { NumberFormatUSD } from '@/helpers/functions';

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


const TableTemporal = ({ form, showAction = true }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = React.useState(false);
  const params = useParams();
  const querys = useSearchParams();

  const {
    loadingTable,
    colaboradoresSeleccionados = [],
  } = useSelector((state: any) => state.recursosHumanos);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);
  console.log('auth :>> ', auth);

  console.log('colaboradoresSeleccionados', colaboradoresSeleccionados)
  const getMenuItems = (record: any): any[] => [
    {
      key: '1',
      label: (
        <a onClick={(e) => {
          e.preventDefault();

          form.resetFields();

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
          dispatch(setOpenDrawer(true));
        }}>Editar contratación</a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          dispatch(setDetalleDeContratacion(record));
          router.push(`/recursos-humanos/contrataciones/${record?.id}`);
        }}>Ver detalle completo</a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: '3',
      label: (
        <a onClick={async (e) => {
          e.preventDefault();
          const link = await copyLink(`/contrataciones/${record?.id}`);
          messageApi.open({
            type: 'success',
            content: <span><a href={link}>{link}</a> copiado con éxito!</span>,
          });
        }}>Copiar link</a>
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
            title: "Seguro de desactivar contratación?",
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
        }}>Desactivar contratación</a>
      ),
      icon: <DeleteOutlined />,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de colaboradores de la nómina, ${colaboradoresSeleccionados.length} resultados`}</Typography.Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'Colaborador',
          dataIndex: 'nombres',
          key: 'nombres',
          render: (text, record, index) => (`${record?.nombres} ${record?.apellidos}`),
        },
        {
          title: 'Salario',
          dataIndex: 'dailySalary',
          key: 'dailySalary',
          render: (text, record, index) => (record?.dataFormNomina?.dailySalary || ""),
        },
        {
          title: 'Dias de trabajo',
          dataIndex: 'diasDeTrabajo',
          key: 'diasDeTrabajo',
          render: (text, record, index) => (record?.dataFormNomina?.diasDeTrabajo || ""),
        },
        {
          title: 'Prima dominical',
          dataIndex: 'primaDominical',
          key: 'primaDominical',
          render: (text, record, index) => (record?.dataFormNomina?.primaDominical || ""),
        },
        {
          title: 'Dias de faltas',
          dataIndex: 'diasDeFaltas',
          key: 'diasDeFaltas',
          render: (text, record, index) => (record?.dataFormNomina?.diasDeFaltas || ""),
        },
        {
          title: 'Dias sin sueldo',
          dataIndex: 'permisosSinGoceDeSueldo',
          key: 'permisosSinGoceDeSueldo',
          render: (text, record, index) => (record?.dataFormNomina?.permisosSinGoceDeSueldo || ""),
        },
        {
          title: 'Ajustes',
          dataIndex: 'ajustes',
          key: 'ajustes',
          render: (text, record, index) => (record?.dataFormNomina?.ajustes || ""),
        },
        {
          title: 'Total',
          dataIndex: 'total',
          key: 'total',
          render: (text, record, index) => (record?.dataFormNomina?.total || ""),
        }

        /* {
          title: 'Estado',
          dataIndex: 'estadoContratacion',
          key: 'estadoContratacion',
          render: (text, record, index) => {
            return text == "Activo"
              ? <Tag color="success">{text}</Tag>
              : <Tag color="processing">{text}</Tag>
          },
        }, */

        /* {
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
        }, */
      ],
    },

  ];

  if (loadingTable) {
    return <SkeletonUsuarios />
  }

  return (
    <>
      <Row gutter={12} style={{ marginTop: "1rem" }}>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Table
            footer={() => {
              const totalNomina = (colaboradoresSeleccionados || []).reduce((a: any, cv: any) => a + Number(cv.dataFormNomina.total), 0);
              return <Typography.Title level={5}>Total de la nómina: {NumberFormatUSD(totalNomina)}</Typography.Title>
            }}
            pagination={false}
            bordered
            columns={columns}
            dataSource={colaboradoresSeleccionados}
            scroll={{
              x: 425,
            }} size="small" />
        </Col>


      </Row>
      <Row gutter={12}>
        <Divider></Divider>
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto", display: showAction ? 'flex' : 'none' }}>
            <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block /* htmlType="reset" */>
              Limpiar
            </Button>
            <Button loading={loading} icon={<SaveOutlined />} type="primary" block onClick={async () => {
              setLoading(true);
              const [fechaRegistro] = new Date().toISOString().split("T");
              const colaboradoresNominasMap = colaboradoresSeleccionados.map((colaborador: any) => {
                // EL FOR IN SE AGREGA PARA VERIFICAR QUE NO HAYA VALORES UNDEFINED O NULL
                const colaboradorFormated: any = {}
                for (const key in colaborador) {
                  colaboradorFormated[key] = colaborador[key] || "";
                }

                return {
                  ...colaboradorFormated,
                  // idColaborador: colaborador.id,
                  dataFormNomina: colaborador?.dataFormNomina
                }
              });

              await FireStoreRecursosHumanos.registrarNominas(auth?.empresa?.id, {
                id: params?.idNomina && !querys.get('reusar') ? params?.idNomina : "",
                fechaRegistroDoc: fechaRegistro,
                colaboradoresNominas: colaboradoresNominasMap,
                usuario: auth?.uid,
                usuarioResponsable: auth?.displayName || "Desconocido",
                estatus: "Activa"
              });

              dispatch(setColaboradoresSeleccionados([]));
              dispatch(setOpenDrawerNomina(false));

              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `Nómina ${params?.idNomina && !querys.get('reusar') ? 'actualizada' : 'registrada'} con éxito!`,
                showConfirmButton: false,
                timer: 3000
              });
              setLoading(false);
            }} /* htmlType="submit" */>
              Guardar
            </Button>
          </Flex>
        </Col>
      </Row>
    </>

  )
}

export default TableTemporal;