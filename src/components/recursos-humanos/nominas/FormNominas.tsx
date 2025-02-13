"use client";
import { Button, Col, Divider, Flex, Form, Input, message, Modal, Row, Select, Switch, TimePicker, Tooltip, Typography } from 'antd';
import * as React from 'react'
import Swal from 'sweetalert2';
import {
  UndoOutlined,
  SaveOutlined,
  SmileOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setLoading, setNewSucursalId, setOpenDrawer, setRefresh } from '@/features/configuracionSlice';
import { setColaboradoresSeleccionados, setIsNewAdicionalNominaId, setIsNewIncapacidadNominaId, setListaDeAdicionalesNominas, setListaDeIncapacidadesNominas, setListaDeUsuarios, setOpenDrawerSucursal, setOpenModalAdicionales, setOpenModalIncapacidades } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { onAuthStateChanged } from 'firebase/auth';
import FormAdicionalesNominas from './FormAdicionalesNominas';
import FormIncapacidadesNominas from './FormIncapacidadesNominas';
import Draggable from 'react-draggable';
import { calcualteSalaryTotal } from './functions/calculate-salary-total';
dayjs.extend(customParseFormat);

interface Additional {
  id: string;
  fechaRegistro: Date,
  nombre: string;
  multiplicador: string;
  tipoDeOperacion: string;
  metodoDeCalculo: string;
  tope: string;
  eliminado: boolean;
}

const style: React.CSSProperties = { width: '100%' };

const TIPO_DE_SUCURSAL = [
  { label: 'Tienda', value: 'Tienda' },
  { label: 'Oficina', value: 'Oficina' },
  { label: 'Bodega', value: 'Bodega' },
  { label: 'Centro de Distribución', value: 'Centro de Distribución' }
];

const OPTIONS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];


const FormNominas = ({ form, collaborator, handleCancel }: any) => {
  const dispatch = useDispatch();
  const [formAdicionales] = Form.useForm();
  const [formIncapacidades] = Form.useForm();
  const [additionalIds, setAdditionalIds] = React.useState<string[]>([]);
  const [additionalsData, setAdditionalsData] = React.useState<Additional[]>([]);

  const draggleRef = React.useRef<HTMLDivElement>(null);

  const {
    loading,
    detalleDeSucursal,
    // google maps
    coordinates,
    address,
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    colaboradoresSeleccionados,
    isNewAdicionalNominaId,
    isNewIncapacidadNominaId,
    listaDeAdicionalesNominas = [],
    listaDeIncapacidadesNominas = [],
    openModalAdicionales,
    openModalIncapacidades,
    listaDeUsuarios = []
  } = useSelector((state: any) => state.recursosHumanos);

  const ADICONALES_NOMINAS = listaDeAdicionalesNominas.map((item: any) => {
    return { ...item, label: item?.nombre, value: item?.id }
  });
  const INCAPACIDADES_NOMINAS = listaDeIncapacidadesNominas.map((item: any) => {
    return { ...item, label: item?.folio, value: item?.id }
  });


  React.useEffect(() => {
    if (auth?.empresa || (auth?.empresa && isNewAdicionalNominaId)) {
      FireStoreRecursosHumanos.listarAdicionalesNominas({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeAdicionalesNominas) => {
        dispatch(setListaDeAdicionalesNominas(listaDeAdicionalesNominas));
      });
    }
  }, [auth, isNewAdicionalNominaId]);

  // AL REGISTRAR UN NUEVO ADICIONAL AGREGAMOS ESE ADICIONAL AL SELECT MULTIPLE
  React.useEffect(() => {
    if (isNewAdicionalNominaId) {
      setTimeout(() => {
        dispatch(setIsNewAdicionalNominaId(null));
        const idsAdicionales = form.getFieldValue("adicionales") || [];
        form.setFieldValue("adicionales", Array.from(new Set([...idsAdicionales, isNewAdicionalNominaId])));
      }, 600);
    }
  }, [listaDeAdicionalesNominas, isNewAdicionalNominaId]);

  React.useEffect(() => {
    if (auth?.empresa || (auth?.empresa && isNewIncapacidadNominaId)) {
      FireStoreRecursosHumanos.listarIncapacidadesNominas({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeIncapacidadesNominas) => {
        dispatch(setListaDeIncapacidadesNominas(listaDeIncapacidadesNominas));
      });
    }
  }, [auth, isNewIncapacidadNominaId]);

  // AL REGISTRAR UN NUEVO INCAPACIDAD AGREGAMOS ESE INCAPACIDAD AL SELECT MULTIPLE
  React.useEffect(() => {
    if (isNewIncapacidadNominaId) {
      setTimeout(() => {
        dispatch(setIsNewIncapacidadNominaId(null));
        const idsIncapacidades = form.getFieldValue("incapacidades") || [];
        form.setFieldValue("incapacidades", Array.from(new Set([...idsIncapacidades, isNewIncapacidadNominaId])));
      }, 600);
    }
  }, [listaDeIncapacidadesNominas, isNewIncapacidadNominaId]);

  const handleDailySalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calcualteTotal();
  };
  const handleWorkDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calcualteTotal();
  };
  const handleSundayBonusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calcualteTotal();
  };
  const handleDaysAbsencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calcualteTotal();
  };
  const handleHolidaysWorkedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calcualteTotal();
  };
  const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calcualteTotal();
  };
  const handleOthersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calcualteTotal();
  };
  const handleAdditionalSelect = (id: string) => {
    const additionalFinded = findAdditionalById(id);
    if (additionalFinded) {
      setAdditionalIds([...additionalIds, id]);
      setAdditionalsData([...additionalsData, additionalFinded]);
      calcualteTotal();
    }
  };
  const handleAdditionalDeselect = (id: string) => {
    let findedIndex = -1;
    for (let i = 0; i < additionalIds.length; i++) {
      const additional = additionalIds[i];
      if (additional === id) {
        findedIndex = i;
        break;
      }
    }
    if (findedIndex >= 0) {
      additionalIds.splice(findedIndex, 1);
      additionalsData.splice(findedIndex, 1);
      calcualteTotal();
    }
  };
  const findAdditionalById = (id: string) => {
    let additionalFinded = null;
    for (let i = 0; i < listaDeAdicionalesNominas.length; i++) {
      const additional = listaDeAdicionalesNominas[i];
      if (additional.id === id) {
        additionalFinded = additional;
        break;
      }
    }
    return additionalFinded;
  }
  const calcualteTotal = () => {
    let dailySalary = form.getFieldValue("dailySalary");
    let workDays = form.getFieldValue("diasDeTrabajo");
    let sundayBonus = form.getFieldValue("primaDominical");
    let daysAbsences = form.getFieldValue("diasDeFaltas");
    let holidaysWorked = form.getFieldValue("diasFestivosTrabajados");
    let permissions = form.getFieldValue("permisosSinGoceDeSueldo");
    let others = form.getFieldValue("ajustes");
    // let additionals = form.getFieldValue("adicionales");

    const findCollaboratorById = listaDeUsuarios.find((item: any) => item.id === form.getFieldValue("id"));
    if (!findCollaboratorById) {
      message.error("Colaborador no encontrado");
      return;
    }

    const total = calcualteSalaryTotal(dailySalary, workDays, sundayBonus, daysAbsences, holidaysWorked, permissions, others, additionalsData, findCollaboratorById?.tipoDePago);
    form.setFieldValue("total", total);
  };

  return (
    <>
      <Form
        form={form}
        name="login-form"
        layout="horizontal"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        labelAlign="left"
        autoComplete="off"
        style={{ width: "100%" }}
        /* requiredMark={customizeRequiredMark} */
        initialValues={{
          id: "",
          dailySalary: "",
          diasDeTrabajo: "5",
          primaDominical: "0",
          diasDeFaltas: "0",
          diasFestivosTrabajados: "0",
          permisosSinGoceDeSueldo: "0",
          incapacidades: [],
          ajustes: "",
          adicionales: [],
          total: "0"
        }}
        onFinish={async (values) => {
          const cloneColaboradoresSeleccionados = [...colaboradoresSeleccionados];
          const findIndex = colaboradoresSeleccionados.findIndex((colaborador: any) => colaborador.id === values?.id);
          cloneColaboradoresSeleccionados[findIndex] = {
            ...cloneColaboradoresSeleccionados[findIndex],
            dataFormNomina: values
          };

          dispatch(setColaboradoresSeleccionados(cloneColaboradoresSeleccionados));
          handleCancel();
          form.resetFields();

        }
        } >

        <Row gutter={12} style={{ marginTop: "1rem" }}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="dailySalary"
              label="Salario diario"
              rules={[{ required: true, message: 'Ingrese salario diario' }]}
            >
              <Input
                type="number"
                min={0}
                style={style}
                placeholder="Ingrese salario diario"
                onChange={handleDailySalaryChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            {/* start input hidden */}
            <Form.Item
              style={{ display: "none" }}
              name="id"
              label="Id"
              rules={[{ required: false, message: 'Ingrese Id' }]}
            >
              <Input placeholder="Ingrese Id" style={style} />
            </Form.Item>
            {/* end input hidden */}
            <Form.Item
              name="diasDeTrabajo"
              label="Dias de trabajo"
              rules={[{ required: true, message: 'Ingrese dias de trabajo' }]}
            >
              <Input
                type="number"
                min={0}
                style={style}
                placeholder="Ingrese dias de trabajo"
                onChange={handleWorkDaysChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="primaDominical"
              label="Prima dominical"
              rules={[{ required: true, message: 'Ingrese Prima dominical' }]}
            >
              <Input
                type="number"
                min={0}
                style={style}
                placeholder="Ingrese Prima dominical"
                onChange={handleSundayBonusChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="diasDeFaltas"
              label="Días de faltas"
              rules={[{ required: true, message: 'Ingrese días de faltas' }]}
            >
              <Input
                type="number"
                min={0}
                style={style}
                placeholder="Ingrese días de faltas"
                onChange={handleDaysAbsencesChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="diasFestivosTrabajados"
              label="Días festivos trabajados"
              rules={[{ required: true, message: 'Ingrese días festivos trabajados' }]}
            >
              <Input
                type="number"
                min={0}
                style={style}
                placeholder="Ingrese días festivos trabajados"
                onChange={handleHolidaysWorkedChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="permisosSinGoceDeSueldo"
              label="Permisos sin goce de sueldo"
              rules={[{ required: true, message: 'Ingrese permisos sin goce de sueldo' }]}
            >
              <Input
                type="number"
                min={0}
                style={style}
                placeholder="Ingrese permisos sin goce de sueldo"
                onChange={handlePermissionsChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="incapacidades"
              label="Incapacidades"
              rules={[{ required: false, message: 'Ingrese incapacidades' }]}>
              <Select
                mode="multiple"
                options={INCAPACIDADES_NOMINAS}
                placeholder="Seleccione incapacidades"
                style={style}
                showSearch
                optionFilterProp="label"
                onChange={() => { }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button block type="text" icon={<PlusOutlined />} onClick={() => {
                      // Abrir el formulario de registrar articulos
                      formIncapacidades.resetFields();
                      dispatch(setOpenModalIncapacidades(true));
                    }}>
                      Nueva incapacidad
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="ajustes"
              label="Ajustes"
              rules={[{ required: true, message: 'Ingrese ajustes' }]}
            >
              <Input
                type="number"
                min={0}
                style={style}
                placeholder="Ingrese ajustes"
                onChange={handleOthersChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="adicionales"
              label="Adicionales"
              rules={[{ required: false, message: 'Seleccione adicionales' }]}>
              <Select
                mode="multiple"
                options={ADICONALES_NOMINAS}
                placeholder="Seleccione adicionales"
                style={style}
                showSearch
                optionFilterProp="label"
                onChange={() => { }}
                onSelect={handleAdditionalSelect}
                onDeselect={handleAdditionalDeselect}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button block type="text" icon={<PlusOutlined />} onClick={() => {
                      // Abrir el formulario de registrar articulos
                      formAdicionales.resetFields();
                      dispatch(setOpenModalAdicionales(true));
                    }}>
                      Nuevo adicional
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="total"
              label="Total"
            >
              <Input
                type="number"
                min={0}
                style={style}
                disabled={true}
              />
            </Form.Item>
          </Col>
        </Row>



        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
              <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset">
                Limpiar
              </Button>
              <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit">
                Guardar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Modal
        maskClosable={false}
        title={<Typography.Title level={5} style={{ cursor: "move" }}>Agregar adicional</Typography.Title>}
        open={openModalAdicionales}
        onOk={() => { }}
        onCancel={() => {
          dispatch(setOpenModalAdicionales(false));
        }}
        modalRender={(modal) => (
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
        )}
        footer={null}>
        <FormAdicionalesNominas form={formAdicionales} />
      </Modal>

      <Modal
        maskClosable={false}
        title={<Typography.Title level={5} style={{ cursor: "move" }}>Agregar incapacidad</Typography.Title>}
        open={openModalIncapacidades}
        onOk={() => { }}
        onCancel={() => {
          dispatch(setOpenModalIncapacidades(false));
        }}
        modalRender={(modal) => (
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
        )}
        footer={null}>
        <FormIncapacidadesNominas form={formIncapacidades} />
      </Modal>
    </>

  )
}

export default FormNominas;