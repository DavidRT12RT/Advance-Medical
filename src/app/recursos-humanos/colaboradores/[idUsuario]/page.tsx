"use client";
import React, { useState } from "react";
import {
  Col,
  Row,
  Image,
  Typography,
  Divider,
  Button,
  Space,
  Tooltip,
  Grid,
  Collapse,
  Avatar,
  Card,
  Upload,
  Input,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import { useDispatch, useSelector } from "react-redux";
import { setPerfilUsuario } from "@/features/recursosHumanosSlice";
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const style: React.CSSProperties = { width: "100%" };

const page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { idUsuario } = useParams();
  const screens = useBreakpoint();
  const [fileList, setFileList] = useState([]);
  const { perfilUsuario } = useSelector((state: any) => state.recursosHumanos);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (idUsuario) {
      FireStoreRecursosHumanos.buscarUsuario(idUsuario).then((usuario) => {
        dispatch(setPerfilUsuario(usuario));
      });
    }
  }, [idUsuario, loading]);

  const handleChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    file: any
  ) => {
    const updatedList: any = fileList.map((item: any) => {
      if (item.uid === file.uid) {
        return { ...item, customName: e.target.value };
      }
      return item;
    });
    setFileList(updatedList);
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <Tooltip title="Atras">
                  <Button
                    onClick={() => {
                      router.back();
                    }}
                    type="primary"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                  />
                </Tooltip>
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: "0px" }}>
                  Perfil completo del colaborador
                </Title>
              </Col>
            </Space>
          </Col>
        </Row>
      </Space>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={6}>
          <div
            style={{
              ...style,
              borderRadius: "1rem",
              background: "#f2f2f2",
              textAlign: "center",
              padding: screens.md ? "1rem" : "0.5rem",
              margin: "auto",
            }}
          >
            {Boolean(perfilUsuario?.photoURL) ? (
              <Image
                style={{ borderRadius: "1rem" }}
                width={150}
                src={perfilUsuario?.photoURL}
              />
            ) : (
              <Avatar shape="square" size={150}>
                <UserOutlined style={{ fontSize: "75px" }} />
              </Avatar>
            )}

            <Title level={4} style={{ width: "100%" }}>
              {`${perfilUsuario?.nombres} ${perfilUsuario?.apellidos}`}
            </Title>

            <div style={{ display: "flex", alignItems: "center" }}>
              <Text>{perfilUsuario?.puesto?.toUpperCase()}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text>{perfilUsuario?.id}</Text>
            </div>

            <Divider />

            <div style={{ display: "flex", alignItems: "center" }}>
              <PhoneOutlined style={{ marginRight: 8 }} />
              <Text>{perfilUsuario?.telefono}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <MailOutlined style={{ marginRight: 8 }} />
              <Text>{perfilUsuario?.email}</Text>
            </div>

            <Divider />

            <div style={{ display: "flex", alignItems: "center" }}>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              <Text>{perfilUsuario?.direccion}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <Text>{perfilUsuario?.fechaNacimiento}</Text>
            </div>

            <Divider />

            <div style={{ display: "flex", alignItems: "center" }}>
              <Text>{perfilUsuario?.genero?.toUpperCase()}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text>{perfilUsuario?.estadoCivil?.toUpperCase()}</Text>
            </div>
          </div>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={16} lg={18} xl={18}>
          <div
            style={{
              ...style,
              /* borderRadius: "1rem", */
              /* background: "#f2f2f2", */
              textAlign: "left",
              padding: "0px", //screens.md ? "1rem" : "0.5rem",
              margin: "auto",
            }}
          >
            <Collapse
              defaultActiveKey={["1", "2", "3", "4"]}
              items={[
                {
                  key: "1",
                  label: (
                    <Text
                      style={{
                        fontWeight: "bold",
                        /*  fontSize: "1rem", */ textAlign: "left",
                      }}
                    >
                      Información de empleo
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Puesto</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.puesto || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Número de seguro social</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.numeroDeSeguroSocial || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>CURP</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.curp || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>RFC</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.rfc || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Sucursal</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.sucursal || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Fecha de registro ó ingreso</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.fechaRegistroIngreso || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Fecha de contrato</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.fechaDeContrato || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Tipo de contrato</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.tipoDeContrato || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Duración del contrato</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.duracionDelContrato || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Fecha de finalización del contrato</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.fechaDeFinalizacionDelContrato ||
                                "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Supervisor ó gerente asignado</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.supervisorOGerenteAsignado ||
                                "---"}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Text
                      style={{
                        fontWeight: "bold",
                        /*  fontSize: "1rem", */ textAlign: "left",
                      }}
                    >
                      Nomina(Opcional)
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Salario base</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.salarioBase || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Tipo de pago</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.tipoDePago || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Clave bancaria</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.claveBancaria || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Deducciones</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.deducciones || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Bonificaciones</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.bonificaciones || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Comisiones</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.comisiones || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Prestaciones adicionales</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.prestacionesAdicionales || "---"}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: "3",
                  label: (
                    <Text
                      style={{
                        fontWeight: "bold",
                        /*  fontSize: "1rem", */ textAlign: "left",
                      }}
                    >
                      Información para vacaciones: (Opcional)
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={24}
                          lg={8}
                          xl={8}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text>Días de vacaciones asignados</Text>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {perfilUsuario?.diasDeVacionesAsignados || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        ></Col>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={12}
                          lg={8}
                          xl={8}
                        ></Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: "4",
                  label: (
                    <Text
                      style={{
                        fontWeight: "bold",
                        /*  fontSize: "1rem", */ textAlign: "left",
                      }}
                    >
                      Archivos: (Opcional)
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col
                          className="gutter-row"
                          xs={24}
                          sm={24}
                          md={24}
                          lg={24}
                          xl={24}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "10px",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Card style={style}>
                              {perfilUsuario?.archivos &&
                              perfilUsuario.archivos.length > 0 ? (
                                <Upload
                                  listType="picture"
                                  fileList={perfilUsuario.archivos.map(
                                    (archivo: any, index: string) => ({
                                      uid: index.toString(),
                                      name: archivo.name,
                                      status: "done",
                                      url: archivo.url,
                                      description: archivo.description,
                                    })
                                  )}
                                  showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: false,
                                  }}
                                  itemRender={(originNode, file: any) => {
                                    return React.cloneElement(originNode, {
                                      children: (
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              maxWidth: "600px",
                                            }}
                                          >
                                            {originNode.props.children}
                                          </div>
                                          {file.description && (
                                            <div
                                              style={{
                                                fontSize: "0.8rem",
                                                color: "#999",
                                                marginLeft: "55px",
                                                paddingBottom: "5px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                maxWidth: "600px",
                                              }}
                                            >
                                              {file.description}
                                            </div>
                                          )}
                                        </div>
                                      ),
                                    });
                                  }}
                                  style={{
                                    width: "100%",
                                    // float: "left",
                                    padding: "0.5rem",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                    alignItems: "center",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                />
                              ) : (
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                  }}
                                >
                                  ---
                                </Text>
                              )}
                            </Card>
                          </div>
                        </Col>
                      </Row>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>
      {/* CARGAR ARCHIVOS */}
      <Row
        gutter={12}
        justify="end"
        style={{
          ...style,
          marginTop: "2rem",
        }}
      >
        <Col className="gutter-row" xs={24} sm={24} md={16} lg={18} xl={18}>
          <Card style={style}>
            <Upload
              listType="picture"
              fileList={fileList}
              multiple
              onChange={handleChange}
              beforeUpload={() => false}
              itemRender={(originNode, file: any) => {
                return (
                  <div
                    style={{
                      width: "50%",
                      float: "left",
                      padding: "0.5rem",
                    }}
                  >
                    {originNode} {/* Muestra la vista previa del archivo */}
                    <Input
                      placeholder="Descripcion del archivo"
                      value={file.customName || ""} // Muestra el nombre actual del archivo
                      onChange={(e) => handleNameChange(e, file)}
                    />
                  </div>
                );
              }}
            >
              <Button
                size="large"
                type="dashed"
                block
                icon={<PaperClipOutlined />}
              >
                Seleccionar archivos
              </Button>
            </Upload>

            {Boolean(fileList.length) && (
              <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={24}
                  lg={6}
                  xl={6}
                />
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={24}
                  lg={12}
                  xl={12}
                >
                  <Button
                    type="primary"
                    loading={loading}
                    block
                    size="large"
                    onClick={async () => {
                      setLoading(true);
                      await FireStoreRecursosHumanos.subirArchivos(
                        idUsuario,
                        fileList
                      );

                      setFileList([]);
                      setLoading(false);
                    }}
                  >
                    Cargar archivos
                  </Button>
                </Col>
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={24}
                  lg={6}
                  xl={6}
                />
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default page;
