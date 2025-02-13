"use client";
import React from 'react'
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Col, Divider, Flex, Row, Table, TableProps, Typography } from 'antd';
import { UndoOutlined, SaveOutlined } from '@ant-design/icons';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import SkeletonUsuarios from '../colaboradores/SkeletonColaboradores';
import { setColaboradoresSeleccionados, setOpenDrawerNomina } from '@/features/recursosHumanosSlice';
import { calcualteSalaryTotal } from './functions/calculate-salary-total';

dayjs.extend(customParseFormat);

const TableFormNominas = ({ data }:any) => {
  const dispatch = useDispatch();
  const { loadingTable, colaboradoresSeleccionados = [] } = useSelector((state: any) => state.recursosHumanos);
  const { auth } = useSelector((state: any) => state.configuracion);
  const [ loading, setLoading ] = React.useState(false);

  const columns: TableProps<any>['columns'] = [
    {
      title: <Typography.Title level={5}>{`Lista de colaboradores, ${colaboradoresSeleccionados.length} resultados`}</Typography.Title>,
      dataIndex: 'catalogo',
      key: 'catalogo',
      children: [
        {
          title: 'Colaborador',
          dataIndex: 'nombres',
          key: 'nombres',
          render: (text, record, index) => (`${record.colaborador?.nombres} ${record.colaborador?.apellidos}`),
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
          render: (text, record, index) => {
            const payroll = record?.dataFormNomina;
            const collaborator = record?.colaborador;
            if(collaborator) {
              const paymentType = collaborator.tipoDePago;
              const total = calcualteSalaryTotal(payroll.salario, payroll.diasDeTrabajo, payroll.primaDominical, payroll.diasDeFaltas, payroll.diasFestivosTrabajados, payroll.permisosSinGoceDeSueldo, payroll.ajustes, payroll.adicionales, paymentType);
              return total || "0.00";
            } else {
              return "0.00";
            }
          },
        }
      ]
    }
  ];

  if(loadingTable)
    return <SkeletonUsuarios />;
  if(!data)
    return null;

  return (
    <>
      <Row gutter={12} style={{ marginTop: "1rem" }}>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Table
            pagination={false}
            bordered
            columns={columns}
            dataSource={data}
            scroll={{
              x: 425,
            }} size="small" />
        </Col>


      </Row>
      <Row gutter={12}>
        <Divider></Divider>
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
            <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block /* htmlType="reset" */>
              Limpiar
            </Button>
            <Button loading={loading} icon={<SaveOutlined />} type="primary" block onClick={async () => {
              setLoading(true);
              const [fechaRegistro] = new Date().toISOString().split("T");
              const colaboradoresNominasMap = colaboradoresSeleccionados.map((colaborador: any) => {
                return {
                  idColaborador: colaborador.id,
                  dataFormNomina: colaborador?.dataFormNomina
                }
              });

              await FireStoreRecursosHumanos.registrarNominas(auth?.empresa?.id, {
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
                title: `Nómina ${false ? 'actualizada' : 'registrada'} con éxito!`,
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
  );
};

export default TableFormNominas;