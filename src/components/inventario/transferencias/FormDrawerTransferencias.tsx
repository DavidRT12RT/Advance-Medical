import {
  Badge,
  Button,
  Col,
  Collapse,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { SaveOutlined, UndoOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setDetalleTransferencia,
  setListaDeArticulos,
  setListaDeSucursales,
  setListaDeUnidadesVehiculares,
  setLoadingTransferencia,
  setOpenDrawerTransferencia,
  setRefreshTransferencias,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import DynamicTableArticulos from "./DynamicTableArticulos";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import FireStoreLogistica from "@/firebase/FireStoreLogistica";

export interface Articulo {
  key: number;
  catalogo?: string;
  articulo?: string;
  cantidad: number;
}

const FormDrawerTransferencias = () => {
  const { auth } = useSelector((state: any) => state.configuracion);

  const [form] = Form.useForm();

  const [originSelected, setOriginSelected] = useState(
    form.getFieldValue("origen") ?? ""
  );
  const [articulosList, setArticulosList] = useState<Articulo[]>([]);

  const {
    loadingTransferencia,
    openDrawerTransferencias,
    detalleTransferencia,
  } = useSelector((state: any) => state.inventario);

  const dispatch = useDispatch();

  const { listaDeUnidadesVehiculares, listaDeSucursales, listaDeArticulos } =
    useSelector((state: any) => state.inventario);

  useEffect(() => {
    if (detalleTransferencia) {
      setArticulosList(detalleTransferencia.articulos);
      form.setFieldsValue({
        origen: detalleTransferencia.origen,
        destino: detalleTransferencia.destino,
        usuario: detalleTransferencia.usuario,
        fechaRegistro: detalleTransferencia.fechaRegistro,
        descripcion: detalleTransferencia.descripcion,
      });
    }
  }, [detalleTransferencia]);

  useEffect(() => {
    // Fetch all data I'll need (Unidades por empresa y sucursales)
    const idEmpresa = auth?.empresa?.id;
    const fetchData = async () => {
      // Unidades
      const listarUnidadesVehiculares = await FireStoreLogistica.listarUnidades(
        idEmpresa
      );

      // Bodegas (sucursales)
      const listarSucursales = await FireStoreInventario.listarSucursales({
        idEmpresa,
      });

      dispatch(setListaDeSucursales(listarSucursales));
      dispatch(setListaDeUnidadesVehiculares(listarUnidadesVehiculares));
    };

    if (idEmpresa !== undefined) {
      fetchData();
    }
  }, [auth]);

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;

    const fetchArticulos = async () => {
      try {
        if (!idEmpresa || !originSelected) return;

        // Determinar el tipo de origen buscando en las listas
        const isSucursal = listaDeSucursales.some(
          (sucursal: any) => sucursal.id === originSelected
        );
        const isUnidad = listaDeUnidadesVehiculares.some(
          (unidad: any) => unidad.id === originSelected
        );

        if (!isSucursal && !isUnidad) {
          console.error(
            "El origen seleccionado no coincide con ninguna sucursal o unidad."
          );
          return;
        }

        // Preparar los parámetros correctos para listar los artículos
        const tipoOrigen = isSucursal ? "sucursal" : "unidad";

        // Llamar a la función con los parámetros esperados
        const listarArticulos =
          await FireStoreInventario.listarArticulosPorTipoOrigen({
            idEmpresa,
            tipoOrigen,
            origenId: originSelected,
          });

        dispatch(setListaDeArticulos(listarArticulos));
      } catch (error) {
        console.error("Error al obtener los artículos:", error);
      }
    };

    fetchArticulos();
  }, [
    auth,
    originSelected,
    listaDeSucursales,
    listaDeUnidadesVehiculares,
    dispatch,
  ]);

  useEffect(() => {
    setOriginSelected(form.getFieldValue("origen"));
  }, [form.getFieldValue("origen")]);

  const originAndDestinyOptionsGroup = useMemo(() => {
    return [
      {
        label: <p>Sucursales (bodegas)</p>,
        title: "Sucursales (bodegas)",
        options: listaDeSucursales.map((s: any) => ({
          label: s.nombre,
          value: s.id,
        })),
      },
      {
        label: <p>Unidades Vehiculares</p>,
        title: "Unidades",
        options: listaDeUnidadesVehiculares.map((u: any) => ({
          label: `${u?.marca} - ${u?.modelo} ${u?.rutaAsignada}`,
          value: u.id,
        })),
      },
    ];
  }, [listaDeUnidadesVehiculares, listaDeSucursales]);

  const handleAddArticuloInArray = () => {
    const newArticulo: Articulo = {
      key: Date.now(),
      articulo: undefined,
      cantidad: 0,
    };

    // Actualizamos la lista con la nueva fila
    setArticulosList((prevArticulos) => [...prevArticulos, newArticulo]);
  };

  const handleDeleteArticuloInArray = (key: number) => {
    // Filtramos el artículo que queremos eliminar
    setArticulosList((prevArticulos) =>
      prevArticulos.filter((articulo) => articulo.key !== key)
    );
  };

  const handleUpdateArticuloInArray = (
    key: number,
    field: string,
    value: any
  ) => {
    // Si el campo que se actualiza no es "articulo" ni "cantidad", permite el cambio directamente (Nuevo artículo)
    if (field !== "articulo" && field !== "cantidad") {
      setArticulosList((prevArticulos) =>
        prevArticulos.map((articulo) =>
          articulo.key === key ? { ...articulo, [field]: value } : articulo
        )
      );
      return;
    }

    // Verificar si el artículo ya existe en otra fila
    if (field === "articulo") {
      const isDuplicate = articulosList.some(
        (articulo) => articulo.key !== key && articulo.articulo === value
      );

      if (isDuplicate) {
        Swal.fire({
          title: "Error",
          text: "Este artículo ya está asignado a otra fila. Por favor, elige uno diferente.",
          icon: "error",
        });
        return;
      }
    }

    // Validar la cantidad contra el stock disponible
    if (field === "cantidad") {
      const articuloActual = articulosList.find(
        (articulo) => articulo.key === key
      );
      if (!articuloActual || !articuloActual.articulo) return;
      const articuloDisponible = listaDeArticulos.find(
        (producto: any) => producto.id === articuloActual.articulo
      );
      if (!articuloDisponible) return;
      // Aquí se usa el valor ingresado en lugar del valor en el estado
      if (value > articuloDisponible.cantidad) {
        Swal.fire({
          title: "Error",
          text: `La cantidad ingresada (${value}) excede la cantidad disponible (${articuloDisponible.cantidad}).`,
          icon: "error",
        });
        return;
      }
    }

    // Actualizar el campo si las validaciones se pasan
    setArticulosList((prevArticulos) =>
      prevArticulos.map((articulo) =>
        articulo.key === key ? { ...articulo, [field]: value } : articulo
      )
    );
  };


  const handleSubmit = async (values: any) => {
    dispatch(setLoadingTransferencia(true));
    const { origen, destino, descripcion } = values;

    // Validación: Origen y destino no deben ser iguales
    if (origen === destino) {
      Swal.fire({
        title: "Error",
        text: "El origen y el destino no pueden ser iguales.",
        icon: "error",
        confirmButtonText: "Entendido",
      });

      dispatch(setLoadingTransferencia(false));
      return;
    }

    // Identificar el tipo de origen y destino
    const tipoOrigen = listaDeUnidadesVehiculares.some(
      (unidad: any) => unidad.id === origen
    )
      ? "unidad"
      : listaDeSucursales.some((sucursal: any) => sucursal.id === origen)
      ? "sucursal"
      : null;

    const tipoDestino = listaDeUnidadesVehiculares.some(
      (unidad: any) => unidad.id === destino
    )
      ? "unidad"
      : listaDeSucursales.some((sucursal: any) => sucursal.id === destino)
      ? "sucursal"
      : null;

    // Validación: Origen y destino deben ser válidos
    if (!tipoOrigen || !tipoDestino) {
      Swal.fire({
        title: "Error",
        text: "El origen o el destino no son válidos.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      dispatch(setLoadingTransferencia(false));
      return;
    }

    // Limpiar los artículos para eliminar filas sin asignar
    const articulosCleaned = articulosList.filter(
      (a) =>
        a.articulo !== undefined &&
        a.articulo !== null &&
        a.articulo.trim() !== ""
    );

    // Validación: Debe haber al menos un artículo válido
    if (!articulosCleaned || articulosCleaned.length === 0) {
      Swal.fire({
        title: "Error",
        text: "Debe agregar al menos un artículo válido a la transferencia.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      dispatch(setLoadingTransferencia(false));
      return;
    }

    // VERIFICACIÓN DOBLE: Para cada artículo, chequear que la cantidad solicitada no exceda la cantidad en stock
    for (const articulo of articulosCleaned) {
      const articuloDisponible = listaDeArticulos.find(
        (producto: any) => producto.id === articulo.articulo
      );
      if (!articuloDisponible) {
        Swal.fire({
          title: "Error",
          text: "El artículo seleccionado no se encontró en el inventario.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
        dispatch(setLoadingTransferencia(false));
        return;
      }
      if (articulo.cantidad > articuloDisponible.cantidad) {
        Swal.fire({
          title: "Error",
          text: `La cantidad solicitada para el artículo ${
            articuloDisponible.nombre || articulo.articulo
          } excede la cantidad disponible (${articuloDisponible.cantidad}).`,
          icon: "error",
          confirmButtonText: "Entendido",
        });
        dispatch(setLoadingTransferencia(false));
        return;
      }
    }

    try {
      const idEmpresa = auth?.empresa?.id;
      const idTransferencia = detalleTransferencia?.id;

      const inventarioData = {
        idEmpresa,
        tipoOrigen,
        origen,
        tipoDestino,
        destino,
        articulos: articulosCleaned.map((a) => ({
          articulo_id: a.articulo as string,
          cantidad: a.cantidad,
        })),
      };

      const inventario = await FireStoreInventario.actualizarInventario(
        //@ts-ignore
        inventarioData
      );

      const transferenciaData = {
        id: idTransferencia,
        origen,
        destino,
        articulos: articulosCleaned,
        usuario: auth?.uid,
        descripcion,
      };

      const transferenciaId = await FireStoreInventario.registrarTransferencia(
        idEmpresa,
        transferenciaData
      );

      const unidadOrigen =
        tipoOrigen === "unidad" &&
        listaDeUnidadesVehiculares.find((u: any) => u.id === origen);

      const unidadDestino =
        tipoDestino === "unidad" &&
        listaDeUnidadesVehiculares.find((u: any) => u.id === destino);

      const movimientoData = {
        fecha: dayjs().format("YYYY-MM-DD"),
        hora: dayjs().format("HH:mm:ss"),
        tipoMovimiento: "Transferencia",
        origen,
        destino,
        idCompra: null,
        idVenta: null,
        idTransferencia: transferenciaId,
        noArtInvolucrados: articulosCleaned.length,
        usuarioResponsable: auth?.uid,
        nombreUsuarioResponsable:auth?.displayName,
        nombreOrigen:
          tipoOrigen === "sucursal"
            ? `SUCURSAL - ${
                listaDeSucursales.find((s: any) => s.id === origen)?.nombre
              }`
            : `UNIDAD VEHICULAR - ${unidadOrigen?.marca} ${unidadOrigen?.modelo}`,
        nombreDestino:
          tipoDestino === "sucursal"
            ? `SUCURSAL - ${
                listaDeSucursales.find((s: any) => s.id === destino)?.nombre
              }`
            : `UNIDAD VEHICULAR - ${unidadDestino?.marca} ${unidadDestino?.modelo}`,
      };
      
      const movimiento = await FireStoreInventario.registrarMovimiento(
        idEmpresa,
        movimientoData
      );
      Swal.fire({
        title: "Éxito",
        text: idTransferencia
          ? "Transferencia actualizada con éxito!"
          : "Transferencia guardada con éxito.",
        icon: "success",
        confirmButtonText: "Entendido",
      });

      // Limpiar formulario y actualizar estado
      form.resetFields();
      setArticulosList([]);
      dispatch(setOpenDrawerTransferencia(false));
      dispatch(setRefreshTransferencias(true));
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al guardar la transferencia. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    }
    dispatch(setLoadingTransferencia(false));
  };

  return (
    <Drawer
      title={
        detalleTransferencia?.id ? "Ver transferencia" : "Nueva transferencia"
      }
      width={868}
      onClose={() => {
        dispatch(setOpenDrawerTransferencia(false));
        dispatch(setDetalleTransferencia(null));
        form.resetFields();
        setArticulosList([]);
      }}
      open={openDrawerTransferencias}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        borderColor: detalleTransferencia?.id
          ? "orange"
          : "rgba(5, 5, 5, 0.06)",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          origen: detalleTransferencia?.origen || undefined,
          destino: detalleTransferencia?.destino || undefined,
          articulosTransferidos: detalleTransferencia?.articulos || [],
        }}
      >
        <Row gutter={16}>
          {/* Campo Origen */}
          <Col span={12}>
            <Form.Item
              label="Origen"
              name="origen"
              rules={[{ required: true, message: "El origen es obligatorio" }]}
            >
              <Select
                placeholder="Seleccione una bodega o unidad"
                options={originAndDestinyOptionsGroup}
                showSearch
                optionFilterProp="label"
                onChange={(e) => setOriginSelected(e)}
                disabled={detalleTransferencia?.id}
              />
            </Form.Item>
          </Col>

          {/* Campo Destino */}
          <Col span={12}>
            <Form.Item
              label="Destino"
              name="destino"
              rules={[{ required: true, message: "El destino es obligatorio" }]}
            >
              <Select
                placeholder="Seleccione una bodega o unidad"
                options={originAndDestinyOptionsGroup}
                disabled={detalleTransferencia?.id}
              />
            </Form.Item>
          </Col>

          {/* Campo Artículos a Transferir */}
          <Col span={24}>
            <DynamicTableArticulos
              dataSource={articulosList}
              showActions={!detalleTransferencia?.id}
              handleAddArticuloInArray={handleAddArticuloInArray}
              handleDeleteArticuloInArray={handleDeleteArticuloInArray}
              handleUpdateArticuloInArray={handleUpdateArticuloInArray}
              isDisabled={detalleTransferencia?.id}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              label="Descripción"
              name="descripcion"
              rules={[
                {
                  required: true,
                  message:
                    "¡La descripción de la transferencia es obligatoria!",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Ingresa la descripción de la transferencia"
                disabled={detalleTransferencia?.id}
                rows={4}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />
        {/* Botones */}
        <Row justify="center">
          <Space>
            <Button
              icon={<UndoOutlined />}
              danger
              type="primary"
              htmlType="reset"
              onClick={() => form.resetFields()}
              disabled={detalleTransferencia?.id}
            >
              Limpiar
            </Button>
            <Button
              loading={loadingTransferencia}
              icon={<SaveOutlined />}
              type="primary"
              htmlType="submit"
              disabled={detalleTransferencia?.id}
            >
              Guardar
            </Button>
          </Space>
        </Row>
      </Form>
    </Drawer>
  );
};

export default FormDrawerTransferencias;
