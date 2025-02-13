import { Badge, Button, Card, Checkbox, Col, ConfigProvider, DatePicker, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeContrataciones, setLoadingTable } from '@/features/recursosHumanosSlice';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import "../../../app/finanzas.css";
import esES from "antd/lib/locale/es_ES";
import { DEPARTAMENTOS, ROLES } from './FormContrataciones';
const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchContrataciones = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    refresh,
  } = useSelector((state: any) => state.recursosHumanos);

  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const onChangeEstatus = (values: any) => {
    setSelectedStates(values);
  };

  // HANDLER SELECT
  const [selectPuesto, setSelectPuesto] = React.useState<any[]>([]);
  const onChangePuesto = (value: any) => {
    setSelectPuesto(value);
  };

  // HANDLER SELECT
  const [selectedFechas, setSelectedFechas] = React.useState<any[]>([]);
  const handleRangeChange = (dates: any, dateStrings: any) => {
    if (dates)
      setSelectedFechas(dates);
    else
      setSelectedFechas([]);

  };


  React.useEffect(() => {
    if (auth?.empresa) {
      dispatch(setLoadingTable(true));
      FireStoreRecursosHumanos.listarContrataciones({
        idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : ""
      }).then((listaDeContrataciones) => {
        console.log('listaDeContrataciones :>> ', listaDeContrataciones);
        let items: any[] = [...listaDeContrataciones];
        if (search && selectedStates.length) {
          items = listaDeContrataciones.filter(({ nombreDelPuesto, departamento }: any) => {
            return [
              new RegExp(search, "i").test(nombreDelPuesto),
              selectedStates.includes(departamento)
            ].some((v) => v);
          });
        } else if (search) {
          items = listaDeContrataciones.filter(({ nombreDelPuesto }: any) => {
            return [
              new RegExp(search, "i").test(nombreDelPuesto)
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeContrataciones.filter(({ departamento }: any) => {
            return selectedStates.includes(departamento);
          });
        } else if (selectPuesto.length) {
          items = listaDeContrataciones.filter(({ rol }: any) => {
            return selectPuesto.includes(rol);
          });
        } else if (selectedFechas.length) {

          const [fechaInicio, fechaFin] = selectedFechas;

          // Filtrar las fechas dentro del rango
          items = listaDeContrataciones.filter((contratacion: any) => {
            const date = new Date(contratacion?.fechaDeApertura);
            return date >= fechaInicio.startOf("day").toDate() && date <= fechaFin.endOf("day").toDate();
          });
        }

        dispatch(setListaDeContrataciones(items));
        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, refresh, selectedStates, selectPuesto, selectedFechas]);

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


  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search size='large' placeholder="Buscar por Nombre del puesto + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedFechas.length ? 1 : 0)}>
              <Button onClick={() => {
                showModal();
              }} size='large' block icon={<FilterOutlined />}>
                Filtrar
              </Button>
            </Badge>
          </div>
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            // loading
            title="Filtrar contrataciones"
            open={isModalOpen}
            onOk={handleOk}
            footer={null}
            onCancel={handleCancel}>
            <ConfigProvider locale={esES}>
              <Form layout="vertical">

                <Form.Item
                  label={<Typography.Text strong>Rol</Typography.Text>}
                  colon={false}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={style}
                    placeholder="Seleccione rol"
                    // defaultValue={[]}
                    onChange={onChangePuesto}
                    options={ROLES}
                  />
                </Form.Item>

                <Form.Item
                  label={<Typography.Text strong>Departamento</Typography.Text>}
                  colon={false}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <Checkbox.Group
                      options={DEPARTAMENTOS}
                      value={selectedStates}
                      onChange={onChangeEstatus}
                      style={{ display: "flex", flexDirection: "column" }}
                    />
                  </div>
                </Form.Item>

                <Form.Item label={<Typography.Text strong>Fechas</Typography.Text>} colon={false}>
                  <DatePicker.RangePicker style={style} onChange={handleRangeChange} />
                </Form.Item>
              </Form>
            </ConfigProvider>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchContrataciones