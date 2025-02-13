"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Badge, Button, Col, Drawer, Row, Space, Tooltip, Typography } from 'antd'
import { ArrowLeftOutlined, CopyOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import { setColaboradoresSeleccionados, setOpenDrawerNomina } from "@/features/recursosHumanosSlice";
import TableColaboradoresNominas from '@/components/recursos-humanos/nominas/TableColaboradoresNominas';
import SearchColaboradoresNominas from '@/components/recursos-humanos/nominas/SearchColaboradoresNominas';
import TableTemporal from '@/components/recursos-humanos/nominas/TableTemporal';
import { Params, Response } from "./types/payrolls";
import { useForm } from 'antd/es/form/Form';

const page = ({ params }: Params) => {
  const firestoreRecursosHumanos = FireStoreRecursosHumanos;
  const router = useRouter();
  const dispatch = useDispatch();
  const { openDrawerNomina, colaboradoresSeleccionados = [] } = useSelector((state: any) => state.recursosHumanos);
  const { auth } = useSelector((state: any) => state.configuracion);
  const [form] = useForm();
  const [idEmpresa] = useState<string>(auth.empresa.id || "");
  const [idNomina] = useState<string>(params.idNomina);
  // const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [payrolls, setPayrolls] = useState<Response>({
    id: "",
    estatus: "",
    usuario: "",
    usuarioResponsable: "",
    fechaRegistro: new Date(),
    fechaRegistroDoc: "",
    eliminado: false,
    colaboradoresNominas: []
  });

  useEffect(() => {
    firestoreRecursosHumanos.buscarNominas(idEmpresa, idNomina)
      .then((response) => {
        const data: Response = response as unknown as Response;
        console.log("data", data);
        // setPayrolls(data);
        dispatch(setColaboradoresSeleccionados(data?.colaboradoresNominas || []));
      }).catch((error) => {
        console.log("error", error);
      });
  }, [idEmpresa, idNomina]);

  /* useEffect(() => {
    (async () => {
      for (let i = 0; i < payrolls.colaboradoresNominas.length; i++) {
        const payrollCollaborator = payrolls.colaboradoresNominas[i];
        const idUser = payrollCollaborator.idColaborador;
        try {
          const response = await firestoreRecursosHumanos.buscarUsuario(idUser);
          payrolls.colaboradoresNominas[i].colaborador = response as unknown as any;
        } catch (error) {
          console.log("error", error);
        }
      }
    })();
  }, [payrolls]); */

  // const showModal = () => {
  //     setIsModalOpen(true);
  // };
  // const handleOk = () => {
  //     setIsModalOpen(false);
  // };
  // const handleCancel = () => {
  //     setIsModalOpen(false);
  // };

  return (
    <>
      {/* <TableFormNominas data={ payrolls.colaboradoresNominas } />
            <Modal
                maskClosable={false}
                title="Agregar a nómina"
                footer={ null }
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={() => {
                    handleCancel();
                    // const filterColaboradoresSeleccionados = colaboradoresSeleccionados.filter((colaborador: any) => (colaborador?.dataFormNomina));
                    // dispatch(setColaboradoresSeleccionados(filterColaboradoresSeleccionados));
                }}
            >
                <h1>Nomina aqui</h1>
                <FormNominas
                    form={ formNomina }
                    collaborator={ collaborator }
                    handleCancel={ handleCancel }
                />
            </Modal> */}

      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <Tooltip title="Atras">
                  <Button onClick={() => {
                    router.back();
                  }} type="primary" shape="circle" icon={<ArrowLeftOutlined />} />
                </Tooltip>
              </Col>
              <Col>
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Colaboradores para nómina</Typography.Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Badge count={colaboradoresSeleccionados.length}>
              <Button
                type="primary"
                icon={<CopyOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
                onClick={() => {
                  dispatch(setOpenDrawerNomina(true));
                }}
                disabled={!Boolean(colaboradoresSeleccionados.length)}
              >
                Reusar nómina
              </Button>
            </Badge>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={/* false ? 'Editar nómina' :  */'Nueva nómina'}
        width={768}
        onClose={() => dispatch(setOpenDrawerNomina(false))}
        open={openDrawerNomina}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: /* false ? "orange" :  */"rgba(5, 5, 5, 0.06)"
          }
        }}>
        <TableTemporal />
      </Drawer>

      <SearchColaboradoresNominas />
      <TableColaboradoresNominas form={form} />
    </>
  );
};

export default page;
