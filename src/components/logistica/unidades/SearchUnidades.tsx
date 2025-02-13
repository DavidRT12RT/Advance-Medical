"use client";
import { Badge, Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeUnidades, setLoadingTable } from '@/features/finanzasSlice';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import { UnidadStatus } from '../../../types/unidades';
import '../../../app/finanzas.css';


const ESTADOS = [
  { label: UnidadStatus.Disponible, value: UnidadStatus.Disponible },
  { label: UnidadStatus.EnRuta, value: UnidadStatus.EnRuta },
  { label: UnidadStatus.Mantenimiento, value: UnidadStatus.Mantenimiento },
  { label: UnidadStatus.FueraDeServicio, value: UnidadStatus.FueraDeServicio },
];

const { Search } = Input;
const style: React.CSSProperties = { width: '100%' };

const SearchUnidades = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth,
    listaDeSucursales,
  } = useSelector((state: any) => state.configuracion);

  const { listaDeProveedores } = useSelector((state: any) => state.ventas);

  const {
    refresh,
    subCollectionEmpresa,
    listaDeRutas,
  } = useSelector((state: any) => state.finanzas);
  const { tipoVehiculos = [] } = subCollectionEmpresa;


  const getRutaLabel = (ruta: any, listaDeProveedores: any[], listaDeSucursales: any[]) => {
    if (ruta.tipoDeRuta === "Proveedor") {
      const proveedor = listaDeProveedores?.find(p => p.id === ruta.proveedor);
      return `${ruta.tipoDeRuta} - ${proveedor?.nombreProveedor || ''}`;
    } else if (ruta.tipoDeRuta === "Automática") {
      const sucursal = listaDeSucursales?.find(s => s.id === ruta.sucursal);
      return `${ruta.tipoDeRuta} - ${sucursal?.nombre || ''}`;
    }
    return ruta.tipoDeRuta;
  };

  const RUTAS = listaDeRutas.map((ruta: any) => ({
    ...ruta,
    label: getRutaLabel(ruta, listaDeProveedores, listaDeSucursales),
    value: ruta.id
  }));

  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const onChange = (checkedValues: any) => {
    setSelectedStates(checkedValues);
  };

  // HANDLER SELECT
  const [selectedRutas, setSelectedRutas] = React.useState<any[]>([]);
  const [selectedTipoVehiculo, setSelectedTipoVehiculo] = React.useState<any[]>([]);

  const onChangeRutas = (value: any) => {
    setSelectedRutas(value);
  };
  const onChangetipoVehiculo = (value: any) => {
    setSelectedTipoVehiculo(value);
  };


  React.useEffect(() => {
    if (auth?.empresa) {
      dispatch(setLoadingTable(true));
      FireStoreFinanzas.listarUnidadesVehiculares({
        idEmpresa: auth?.empresa?.id || ""
      }).then(async (listaDeUnidades) => {

        let items: any[] = [...listaDeUnidades];
        if (search && selectedStates.length) {
          items = listaDeUnidades.filter(({ idUnidad, placas, nombreChofer, status }: any) => {
            return [
              new RegExp(search, "i").test(idUnidad),
              new RegExp(search, "i").test(placas),
              new RegExp(search, "i").test(nombreChofer),
              selectedStates.includes(status)
            ].some((v) => v);
          });
        } else if (search) {
          items = listaDeUnidades.filter(({ idUnidad, placas, nombreChofer }: any) => {
            return [
              new RegExp(search, "i").test(idUnidad),
              new RegExp(search, "i").test(placas),
              new RegExp(search, "i").test(nombreChofer),
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeUnidades.filter(({ status }: any) => {
            return selectedStates.includes(status);
          });
        } else if (selectedRutas.length) {
          items = listaDeUnidades.filter(({ rutaAsignada }: any) => {
            return selectedRutas.includes(rutaAsignada);
          });
        } else if (selectedTipoVehiculo.length) {
          items = listaDeUnidades.filter(({ tipoVehiculo }: any) => {
            return selectedTipoVehiculo.includes(tipoVehiculo);
          });
        }

        dispatch(setListaDeUnidades(items));

        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, selectedStates, selectedRutas, selectedTipoVehiculo, refresh]);

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
          <Search size='large' placeholder="Buscar por Codigo ó Placa ó Chofer ó Ruta + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={(selectedStates.length + selectedRutas.length + selectedTipoVehiculo.length)}>
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
            title="Filtrar unidades"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Aplicar"
            cancelText="Cerrar"
            footer={null}>

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

              <Form.Item label={<Typography.Text strong>Ruta Asignada</Typography.Text>} colon={false}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Seleccione Rutas"
                  // defaultValue={[]}
                  onChange={onChangeRutas}
                  options={RUTAS}
                />
              </Form.Item>
              <Form.Item label={<Typography.Text strong>Tipo de Vehiculo</Typography.Text>} colon={false}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Seleccione Tipo Vehiculo"
                  // defaultValue={[]}
                  onChange={onChangetipoVehiculo}
                  options={tipoVehiculos}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchUnidades;