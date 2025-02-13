"use client";
import * as React from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  DollarOutlined,
  MessageOutlined,
  BellOutlined,
  FileProtectOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  ReadOutlined,
  ShoppingOutlined,
  ReconciliationOutlined,
  FileTextOutlined,
  AuditOutlined,
  ScheduleOutlined,
  ShopOutlined,
  CreditCardOutlined,
  TruckOutlined,
  AimOutlined,
  ContainerOutlined,
  ProfileOutlined,
  FileSyncOutlined,
  RiseOutlined,
  CarryOutOutlined,
  TagsOutlined,
  FilePdfOutlined,
  SnippetsOutlined,
  TransactionOutlined,
  InteractionOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  List,
  Menu,
  Modal,
  Spin,
  theme,
  Tooltip,
  Typography,
} from "antd";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentValueMenu } from "@/features/recursosHumanosSlice";
import smartrouteLogo from "../../public/smartroute.png";
import Swal from "sweetalert2";
import { getAuth, signOut } from "firebase/auth";
import LinearProgress from "./LinearProgress";
import FormChangePassword from "./empresas/FormChangePassword";
import { setCerrarSesion } from "@/features/configuracionSlice";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const LayoutMain = ({ children }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const { currentValueMenu } = useSelector(
    (state: any) => state.recursosHumanos
  );
  const { auth } = useSelector((state: any) => state.configuracion);

  const [collapsed, setCollapsed] = React.useState(false);
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);
  const [showLoading, setShowLoading] = React.useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] =
    React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menu = (
    <Menu
      onClick={(value) => {
        switch (value?.key) {
          case "change-password":
            setShowChangePasswordModal(true);
            break;
          case "logout":
            Swal.fire({
              title: "Seguro de cerrar sesión?",
              text: "",
              icon: "question",
              showCancelButton: true,
              confirmButtonColor: "#1677ff",
              cancelButtonColor: "#d33",
              confirmButtonText: "Aceptar",
              cancelButtonText: "Cancelar",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  dispatch(setCerrarSesion(true));
                  await signOut(getAuth());
                  router.push("/empresas/login");
                  console.log("Usuario deslogeado correctamente");
                  dispatch(setCerrarSesion(false));
                } catch (error) {
                  console.error("Error al cerrar sesión:", error);
                }
              }
            });
            break;
          default:
            break;
        }
      }}
    >
      <Menu.Item key="profile">
        {auth?.displayName || auth?.email?.split("@")[0] || "Desconocido"}
      </Menu.Item>
      <Menu.Item key="change-password">Cambiar Contraseña</Menu.Item>
      <Menu.Item key="logout">Cerrar sesión</Menu.Item>
    </Menu>
  );

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(false);
  }, []);

  React.useEffect(() => {
    const pathnameArray = pathname.split("/").filter((v) => v);
    const newValue = pathnameArray.join("/");

    if (currentValueMenu !== newValue) {
      dispatch(setCurrentValueMenu(newValue));
    }

    const firstPath = pathnameArray[0];
    setOpenKeys([firstPath]);
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      setShowLoading(false);
    }, 1200);
  }, [pathname, currentValueMenu]);

  const isActiveColor = React.useCallback(
    (key: string) => (currentValueMenu !== key ? "white" : ""),
    [currentValueMenu]
  );

  const elementsMenu = React.useMemo(() => {
    const menu: any = [
      {
        key: "inicio",
        icon: <HomeOutlined style={{ color: isActiveColor("inicio") }} />,
        label: <span style={{ color: isActiveColor("inicio") }}>Inicio</span>,
      },
      {
        key: "logistica",
        icon: (
          <ContainerOutlined style={{ color: isActiveColor("logistica") }} />
        ),
        label: (
          <span style={{ color: isActiveColor("logistica") }}>Logística</span>
        ),
        children: [
          {
            key: "logistica/rutas",
            icon: (
              <AimOutlined
                style={{ color: isActiveColor("logistica/rutas") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("logistica/rutas") }}>
                Rutas
              </span>
            ),
          },
          {
            key: "logistica/choferes",
            icon: (
              <UserOutlined
                style={{ color: isActiveColor("logistica/choferes") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("logistica/choferes") }}>
                Choferes
              </span>
            ),
          },
          {
            key: "logistica/unidades",
            icon: (
              <TruckOutlined
                style={{ color: isActiveColor("logistica/unidades") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("logistica/unidades") }}>
                Unidades
              </span>
            ),
          },
        ],
      },
      {
        key: "inventario",
        icon: (
          <AppstoreOutlined style={{ color: isActiveColor("inventario") }} />
        ),
        label: (
          <span style={{ color: isActiveColor("inventario") }}>Inventarios</span>
        ),
        children: [
          {
            key: "inventario/inventarios",
            icon: (
              <AppstoreOutlined
                style={{ color: isActiveColor("inventario/inventarios") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("inventario/inventarios") }}>
                Inventarios
              </span>
            ),
          },
          {
            key: "inventario/transferencias",
            icon: (
              <InteractionOutlined
                style={{ color: isActiveColor("inventario/transferencias") }}
              />
            ),
            label: (
              <span
                style={{ color: isActiveColor("inventario/transferencias") }}
              >
                Transferencias
              </span>
            ),
          },
          {
            key: "inventario/articulos",
            icon: (
              <TagsOutlined
                style={{ color: isActiveColor("inventario/articulos") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("inventario/articulos") }}>
                Articulos
              </span>
            ),
          },
          {
            key: "inventario/catalogos",
            icon: (
              <ReadOutlined
                style={{ color: isActiveColor("inventario/catalogos") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("inventario/catalogos") }}>
                Catálogos
              </span>
            ),
          },
          {
            key: "inventario/bodegas",
            icon: (
              <BranchesOutlined
                style={{ color: isActiveColor("inventario/bodegas") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("inventario/bodegas") }}>
                Bodegas
              </span>
            ),
          },
          {
            key: "inventario/movimientos",
            icon: (
              <TransactionOutlined
                style={{ color: isActiveColor("inventario/movimientos") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("inventario/movimientos") }}>
                Movimientos
              </span>
            ),
          },
        ],
      },
      {
        key: "ventas",
        icon: (
          <ShoppingCartOutlined style={{ color: isActiveColor("ventas") }} />
        ),
        label: <span style={{ color: isActiveColor("ventas") }}>Ventas</span>,
        children: [
          {
            key: "ventas/ventas",
            icon: (
              <ShoppingCartOutlined
                style={{ color: isActiveColor("ventas/ventas") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("ventas/ventas") }}>
                Ventas
              </span>
            ),
          },
          {
            key: "ventas/lista-de-precios",
            icon: (
              <CarryOutOutlined
                style={{ color: isActiveColor("ventas/lista-de-precios") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("ventas/lista-de-precios") }}>
                Lista de precios
              </span>
            ),
          },
          {
            key: "ventas/clientes",
            icon: (
              <UsergroupAddOutlined
                style={{ color: isActiveColor("ventas/clientes") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("ventas/clientes") }}>
                Clientes
              </span>
            ),
          },
        ],
      },
      {
        key: "compras",
        icon: <ShoppingOutlined style={{ color: isActiveColor("compras") }} />,
        label: <span style={{ color: isActiveColor("compras") }}>Compras</span>,
        children: [
          {
            key: "compras/compras",
            icon: (
              <ShoppingOutlined
                style={{ color: isActiveColor("compras/compras") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("compras/compras") }}>
                Compras
              </span>
            ),
          },
          {
            key: "compras/ordenes-en-transito",
            icon: (
              <ScheduleOutlined
                style={{ color: isActiveColor("compras/ordenes-en-transito") }}
              />
            ),
            label: (
              <span
                style={{ color: isActiveColor("compras/ordenes-en-transito") }}
              >
                Ordenes en tránsito
              </span>
            ),
          },
          {
            key: "compras/proveedores",
            icon: (
              <ReconciliationOutlined
                style={{ color: isActiveColor("compras/proveedores") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("compras/proveedores") }}>
                Proveedores
              </span>
            ),
          },
        ],
      },
      {
        key: "finanzas",
        icon: <DollarOutlined style={{ color: isActiveColor("finanzas") }} />,
        label: (
          <span style={{ color: isActiveColor("finanzas") }}>Finanzas</span>
        ),
        children: [
          {
            key: "finanzas/facturacion",
            icon: (
              <FilePdfOutlined
                style={{ color: isActiveColor("finanzas/facturacion") }}
              />
            ),
            label: (
              <span style={{ color: isActiveColor("finanzas/facturacion") }}>
                Facturación
              </span>
            ),
          },
          {
            key: "finanzas/cuentas-por-pagar",
            icon: (
              <CreditCardOutlined
                style={{ color: isActiveColor("finanzas/cuentas-por-pagar") }}
              />
            ),
            label: (
              <span
                style={{ color: isActiveColor("finanzas/cuentas-por-pagar") }}
              >
                Cuentas por pagar
              </span>
            ),
          },
          {
            key: "finanzas/cuentas-por-cobrar",
            icon: (
              <CreditCardOutlined
                style={{ color: isActiveColor("finanzas/cuentas-por-cobrar") }}
              />
            ),
            label: (
              <span
                style={{ color: isActiveColor("finanzas/cuentas-por-cobrar") }}
              >
                Cuentas por cobrar
              </span>
            ),
          },
        ],
      },
      {
        key: "recursos-humanos",
        icon: <ApartmentOutlined style={{ color: "white" }} />,
        label: <span style={{ color: "white" }}>Recursos Humanos</span>,
        children: [
          {
            key: "recursos-humanos/colaboradores",
            icon: (
              <TeamOutlined
                style={{
                  color: isActiveColor("recursos-humanos/colaboradores"),
                }}
              />
            ),
            label: (
              <span
                style={{
                  color: isActiveColor("recursos-humanos/colaboradores"),
                }}
              >
                Colaboradores
              </span>
            ),
          },
          {
            key: "recursos-humanos/contrataciones",
            icon: (
              <FileProtectOutlined
                style={{
                  color: isActiveColor("recursos-humanos/contrataciones"),
                }}
              />
            ),
            label: (
              <span
                style={{
                  color: isActiveColor("recursos-humanos/contrataciones"),
                }}
              >
                Contrataciones
              </span>
            ),
          },
          {
            key: "recursos-humanos/nominas",
            icon: (
              <SnippetsOutlined
                style={{ color: isActiveColor("recursos-humanos/nominas") }}
              />
            ),
            label: (
              <span
                style={{ color: isActiveColor("recursos-humanos/nominas") }}
              >
                Nóminas
              </span>
            ),
          },
        ],
      },
    ];

    if (auth?.empresa?.isAdmin) {
      menu.splice(1, 0, {
        key: "administracion",
        icon: (
          <SettingOutlined style={{ color: isActiveColor("administracion") }} />
        ),
        label: (
          <span style={{ color: isActiveColor("administracion") }}>
            Administración
          </span>
        ),
        children: [
          {
            key: "administracion/solicitudes",
            icon: (
              <FileTextOutlined
                style={{ color: isActiveColor("administracion/solicitudes") }}
              />
            ),
            label: (
              <span
                style={{ color: isActiveColor("administracion/solicitudes") }}
              >
                Solicitudes
              </span>
            ),
          },
        ],
      });
    }

    return menu;
  }, [currentValueMenu]);

  // PRECARGAMOS LAS RUTAS PARA UNA MEJOR EXPERIENCIA DE USUARIO
  React.useEffect(() => {
    elementsMenu.forEach((item: any) => {
      router.prefetch(`/${item.key}`);
    });
  }, [elementsMenu]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "white",
        }}
      >
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }

  const sliderMenu = (
    <div
      style={{
        width: collapsed ? "80px" : "280px",
        /* transition: "width 0.1s ease", */ position: "relative",
      }}
    >
      <Sider
        style={{
          background: "#007BFF",
          minHeight: "100vh",
          position: "fixed", // Fija el Sider
          left: 0, // Lo fija al lado izquierdo de la pantalla
          top: 0, // Lo fija en la parte superior
          zIndex: 1000, // Ajusta la jerarquía de superposición si es necesario
          width: "inherit",
        }}
        trigger={null}
        collapsible
        collapsed={collapsed && screens.md}
        width={280}
      >
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            background: colorBgContainer,
          }}
        >
          <Image
            src={smartrouteLogo}
            width={200}
            height={100}
            layout="responsive"
            alt="smartroute"
          />
        </Header>

        <div
          style={{
            padding: collapsed ? "16px 16px 0px" : "1rem 2rem 0rem",
            background: "",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                nombre:
                  auth?.displayName ||
                  auth?.email?.split("@")[0] ||
                  "Desconocido",
                cargo: auth?.empresa?.isAdmin ? (
                  <Badge
                    status="success"
                    text={
                      <>
                        <Typography.Text style={{ color: "white" }}>
                          Administrador
                        </Typography.Text>
                      </>
                    }
                  />
                ) : (
                  <Badge
                    status="success"
                    text={
                      <>
                        <Typography.Text style={{ color: "white" }}>
                          Empresa
                        </Typography.Text>
                        <p><Typography.Text strong style={{ color: "white" }}>{auth?.empresa?.nombreDeLaEmpresa}</Typography.Text></p>
                      </>
                    }
                  />
                ),
              },
            ]}
            renderItem={(user, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar size={48}>
                      <UserOutlined />{" "}
                    </Avatar>
                  }
                  title={
                    (!collapsed || !screens.md) && (
                      <span style={{ color: "white" }}>{user.nombre}</span>
                    )
                  }
                  description={
                    (!collapsed || !screens.md) && (
                      <span style={{ color: "white" }}>{user.cargo}</span>
                    )
                  }
                />
              </List.Item>
            )}
          />
        </div>
        <Menu
          theme="light"
          mode="inline"
          style={{ background: "#007BFF", padding: "1rem" }}
          /* defaultSelectedKeys={[currentValueMenu]} */
          //defaultOpenKeys={['recursos-humanos', 'configuracion']}
          selectedKeys={[currentValueMenu]}
          openKeys={openKeys}
          onOpenChange={(keys: string[]) => {
            // Solo mantener el último menú abierto
            const latestOpenKey = keys.find(
              (key) => openKeys.indexOf(key) === -1
            );
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
          }}
          onClick={async (e) => {
            e.domEvent.preventDefault(); // Evitar el comportamiento predeterminado
            setShowLoading(true);
            router.push(`/${e.key}`);
            dispatch(setCurrentValueMenu(e.key));
          }}
          items={elementsMenu}
        />
      </Sider>
    </div>
  );

  return (
    <Layout>
      <Modal
        title="Cambiar Contraseña"
        open={showChangePasswordModal}
        onCancel={() => setShowChangePasswordModal(false)}
        footer={null}
        destroyOnClose
      >
        <FormChangePassword
          onBack={() => setShowChangePasswordModal(false)}
          email={auth?.email}
          onSuccess={async () => {
            setShowChangePasswordModal(false);
            await signOut(getAuth());
            router.push("/empresas/login");
          }}
        />
      </Modal>
      {showLoading && (
        <div
          style={{
            width: "100%",
            position: "absolute",
            left: "0px",
            height: "4px",
            zIndex: 9999,
          }}
        >
          <LinearProgress />
        </div>
      )}
      {screens.md ? (
        sliderMenu
      ) : (
        <Drawer
          // title=""
          closable={false}
          placement="left"
          width={280}
          onClose={() => setCollapsed(!collapsed)}
          open={collapsed}
          styles={{
            body: {
              padding: 0,
              margin: 0,
            },
          }}
        >
          {sliderMenu}
        </Drawer>
      )}
      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            background: colorBgContainer,
          }}
        >
          {/* Botón de menú colapsable */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          {/* Botones a la derecha */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Contactos">
              <Button
                style={{ marginRight: "0.5rem" }}
                type="text"
                shape="circle"
                icon={<MessageOutlined />}
              />
            </Tooltip>
            <Tooltip title="Notificaciones">
              <Button
                style={{ marginRight: "0.5rem" }}
                type="text"
                shape="circle"
                icon={<BellOutlined />}
              />
            </Tooltip>
            {/* Ejemplo de avatar y menú desplegable */}
            <Dropdown overlay={menu} placement="bottomRight">
              <Avatar icon={<UserOutlined />} style={{ marginRight: "1rem" }} />
            </Dropdown>
            {/* Otros botones a la derecha */}
          </div>
        </Header>
        <Content
          style={{
            margin: screens.md ? "24px" : "12px",
            padding: screens.md ? 24 : 12,
            minHeight: `calc(100vh - ${screens.md ? "112" : "88"}px)`,
            background: colorBgContainer,
            overflowY: "auto",
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutMain;