import { Badge, Button, Card, Checkbox, Col, ConfigProvider, DatePicker, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeContrataciones, setListaDeNominas, setLoadingTable } from '@/features/recursosHumanosSlice';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import '../../../app/finanzas.css';
import esES from "antd/lib/locale/es_ES";

const ESTADOS = [
  { label: 'Activa', value: 'Activa' },
  { label: 'Inactiva', value: 'Inactiva' },
];

const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchNominas = () => {

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
  const onChange = (checkedValues: any) => {
    setSelectedStates(checkedValues);
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
      FireStoreRecursosHumanos.listarNominas({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeNominas) => {

        let items: any[] = [...listaDeNominas];
        if (search && selectedStates.length) {
          items = listaDeNominas.filter(({ usuarioResponsable, estatus }: any) => {
            return [
              new RegExp(search, "i").test(usuarioResponsable),
              selectedStates.includes(estatus)
            ].some((v) => v);
          });
        } else if (search) {
          items = listaDeNominas.filter(({ usuarioResponsable }: any) => {
            return [
              new RegExp(search, "i").test(usuarioResponsable)
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeNominas.filter(({ estatus }: any) => {
            return selectedStates.includes(estatus);
          });
        } else if (selectedFechas.length) {

          const [fechaInicio, fechaFin] = selectedFechas;
          // Filtrar las fechas dentro del rango
          items = listaDeNominas.filter((nomina: any) => {
            const date = new Date(nomina?.fechaRegistroDoc);
            return date >= fechaInicio.startOf("day").toDate() && date <= fechaFin.endOf("day").toDate();
          });
        }

        dispatch(setListaDeNominas(items));
        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, refresh, selectedFechas, selectedStates]);

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
          <Search size='large' placeholder="Buscar nómina por responsable + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedStates.length + (selectedFechas.length ? 1 : 0))}>
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
            title="Filtrar nóminas"
            open={isModalOpen}
            onOk={handleOk}
            footer={null}
            onCancel={handleCancel}>
            <ConfigProvider locale={esES}>
              <Form
                layout="vertical">
                <Form.Item label={<Typography.Text strong>Estatus</Typography.Text>} colon={false}>
                  <Checkbox.Group
                    options={ESTADOS}
                    value={selectedStates}
                    onChange={onChange}
                    style={{ display: 'flex', flexDirection: 'column' }} // Disposición vertical
                  />
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

export default SearchNominas