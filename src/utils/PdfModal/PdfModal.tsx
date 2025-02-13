//GUIA DE USO DE PdfModal

// 1 - Importa el icono <DownloadOutlined /> de Ant Design para usarlo en el boton de "Descargar PDF" :
// import { DownloadOutlined } from "@ant-design/icons";

// 2 - Agrega el siguiente estado en la pagina :
//   const [isModalVisible, setIsModalVisible] = useState(false);

// 3 - Agrega al evento onClick setIsModalVisible(true) para que aparezca PdfModal, Ejemplo:
//        {
//       key: "4",
//       label: (
//         <div>
//           <div onClick={() => setIsModalVisible(true)}>Descargar PDF</div>
//         </div>
//       ),
//       icon: <DownloadOutlined />,
//     },

// 4 - Agrega < PdfModal /> fuera de < Table /> para que se muestre correctamente y pasa las props, Ejemplo:
//     <>
//       <Table
//         bordered
//         columns={columns}
//         // dataSource={ [] }
//         dataSource={listaDeCompras}
//         scroll={{
//           x: 768,
//         }}
//         size="small"
//       />
//       <PdfModal
//         visible={isModalVisible}
//         onClose={() => setIsModalVisible(false)}
//         data={facturaData}
//         onDownload={() => console.log("PDF descargado")}
//       />
//    </>

//     EJEMPLO DE COMO ESPERA PdfModal QUE SEA facturaData:
// const facturaData = {
//     logoUrl: "/smartrouteLogoSinFondo.png",
//     nameUsuario: "{Nombre de Usuario}",
//     folio: "1234",
//     sucursal: "{Bodega o Oficina}",
//     fecha: "2025/01/14",
//     direccionSucursal: "{Direccion de Sucursal}",
//     nameProvedor: "{Proveedor}",
//     metodoPago: "{Metodo de pago}",
//     moneda: "{moneda}",
//     direccionProvedor: "{Direccion Proveedor}",
//     metodoEntrega: "{Metodo de entrega}",
//     fechaEstimadaEntrega: "{Fecha Estimada de Entrega}",
//     items: [
//       { code: "001", quantity: 1, price: 100 },
//       { code: "002", quantity: 2, price: 200 },
//       { code: "003", quantity: 2, price: 200 },
//       { code: "004", quantity: 2, price: 200 },
//       { code: "005", quantity: 2, price: 200 },
//     ],
//     subtotal: 500,
//     descuento: 50,
//     tax: 72,
//     total: 522,
//     nameEncargado: "{Nombre de Encargado}",
//   };

"use client";
import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import {
  pdf,
  Page,
  Text,
  Document,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import SpinComponent from "./Spin";

type PdfEditorModalProps = {
  visible: boolean;
  onClose: () => void;
  data: {
    title?: string;
    description?: string;
    logoUrl?: string;
    [key: string]: any; // Para otros datos relevantes de la factura
  };
  onDownload?: () => void;
};

type PdfFormData = {
  title: string;
  description: string;
  primaryColor?: string;
  secondaryColor?: string;
};

const PdfModal: React.FC<PdfEditorModalProps> = ({
  visible,
  onClose,
  data,
  onDownload,
}) => {
  const [formData, setFormData] = useState<PdfFormData>({
    title: "AGREGA TITULO",
    description: "*Agrega tu Descripcion Aqui*",
    primaryColor: "#ECAB0F",
    secondaryColor: "#1B2A55",
  });

  const handleFormChange = (changedFields: Partial<PdfFormData>) => {
    setFormData((prev) => ({ ...prev, ...changedFields }));
  };

  const handleDownload = async () => {
    const blob = await pdf(<PdfDocument {...formData} data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.title || "invoice"}.pdf`;
    link.click();

    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Modal
      title="Edita y Descarga tu Factura"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="download" type="primary" onClick={handleDownload}>
          Descargar PDF
        </Button>,
        <Button key="cancel" type="primary" onClick={onClose}>
          Cancelar
        </Button>,
      ]}
    >
      <div style={{ display: "flex", gap: "20px", width: "800px" }}>
        {/* Previsualización PDF */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            padding: "10px",
            width: "100%",
          }}
        >
          <PdfPreview formData={formData} data={data} />
        </div>
        {/* Formulario de edición */}
        <Form
          layout="vertical"
          initialValues={formData}
          onValuesChange={(_, values) => handleFormChange(values)}
        >
          <Form.Item label="Título" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="Descripción" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Color Primario" name="primaryColor">
            <Input
              type="color"
              value={formData.primaryColor}
              onChange={(e) =>
                handleFormChange({ primaryColor: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Color Secundario" name="secondaryColor">
            <Input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) =>
                handleFormChange({ secondaryColor: e.target.value })
              }
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

// Documento PDF
const PdfDocument: React.FC<
  PdfFormData & { data: PdfEditorModalProps["data"] }
> = ({
  title,
  description,
  data,
  primaryColor = "#ECAB0F",
  secondaryColor = "#1B2A55",
}) => {
  const styles = StyleSheet.create({
    page: { fontFamily: "" },
    locationIcon: { width: "15", height: "15" },
    top: {
      height: "35px",
      width: "100%",
      display: "flex",
      flexDirection: "row",
    },
    childrenTop1: {
      flex: 1,
      textAlign: "center",
    },
    childrenTop2: {
      flex: 1,
      textAlign: "center",
      backgroundColor: primaryColor,
    },

    header: {
      height: "180px",
      flexDirection: "row",
      paddingHorizontal: "15px",
      // alignItems: "flex-start",
      // justifyContent: "space-between",
      backgroundColor: secondaryColor,
      color: "white",
    },
    childrenHeader1: {
      flex: 1,
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "10px",
      paddingBottom: "5px",
      paddingTop: "20px",
      // paddingVertical: "5px",
    },
    childrenHeader2: {
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "25px",
    },
    wrapTitleDescription: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
    },
    sectionDownDescription: {
      flexDirection: "column",
      alignItems: "flex-start",
      fontSize: 14,
    },

    wrapDownHeader: {
      height: "45px",
      width: "100%",
      display: "flex",
      flexDirection: "row",
    },
    childrenWrapDownHeader1: {
      flex: 1,
      textAlign: "center",
      paddingTop: "12px",
      backgroundColor: primaryColor,
    },
    childrenWrapDownHeader2: {
      flex: 1,
      textAlign: "center",
    },

    title: { fontSize: 24, fontWeight: "bold", color: primaryColor },
    logo: { width: "auto", height: "50" },
    sectionProvedor: {
      display: "flex",
      flexDirection: "row",
      // paddingTop: "15px",
      paddingBottom: "25px",
      gap: "10",
    },
    childrenSectionProvedor1: { flex: 1, fontSize: 18 },
    childrenSectionProvedor2: { flex: 1, fontSize: 18 },
    body: { marginTop: 20, padding: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { marginBottom: 10, fontWeight: "bold", fontSize: 24 },
    table: { borderTop: "1px solid black" },
    row: { flexDirection: "row", justifyContent: "space-between", padding: 5 },
    cell: { width: "25%", textAlign: "center" },
    totales: {
      flex: 1,
      marginTop: 20,
      alignItems: "flex-end",
      marginVertical: "25px",
      gap: "10",
      marginRight: "25px",
    },
    total: {
      backgroundColor: secondaryColor,
      color: "white",
      marginTop: "20px",
      padding: "12px",
    },
    descuento: { fontWeight: "bold", color: "black" },
    subtotal: { fontWeight: "bold", color: "black" },
    iva: { fontWeight: "bold", color: "black" },
    tableHeader: {
      flexDirection: "row",
      fontWeight: "bold",
      paddingVertical: "25px",
      color: "white",
      backgroundColor: secondaryColor,
      padding: 5,
    },
    tableHeaderCell: {
      flex: 1,
      // fontSize: 10,
      fontWeight: "bold",
      textAlign: "center",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      padding: 5,
    },
    tableCell: {
      flex: 1,
      // fontSize: 10,
      textAlign: "center",
    },
    seccionTotalesyEncargado: {
      display: "flex",
      flexDirection: "row",
      // paddingTop: "15px",
      alignItems: "center",
      paddingBottom: "25px",
      gap: "10",
    },
    seccionEncargado: {
      flex: 1,
      // fontSize: 10,
      marginTop: "135px",
      textAlign: "center",
      gap: "10",
    },
    lineNameEncargado: {
      borderBottomWidth: 2,
      borderBottomColor: "black",
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* <View style={styles.top}>
          <Text style={styles.childrenTop1} />
          <Text style={styles.childrenTop2} />
        </View> */}

        <View style={styles.header}>
          <View style={styles.childrenHeader1}>
            {data.logoUrl ? (
              <Image src={data.logoUrl} style={styles.logo} />
            ) : (
              <Image src={"/logo-empresa-default.png"} style={styles.logo} />
            )}
            <Text style={{ fontSize: 14 }}>Responsable:{data.nameUsuario}</Text>
            <Text style={{ fontSize: 14 }}>{description}</Text>
          </View>

          <View style={styles.childrenHeader2}>
            <View style={styles.wrapTitleDescription}>
              <Text style={styles.title}>{title}</Text>
              {/* <Text>{description}</Text> */}
            </View>
            <View style={styles.sectionDownDescription}>
              <Text>Folio: {data.folio}</Text>
              <Text>Sucursal: {data.sucursal}</Text>
              <Text>Fecha: {data.fecha}</Text>
            </View>
          </View>
        </View>

        <View style={styles.wrapDownHeader}>
          <Text style={styles.childrenWrapDownHeader1}>
            {data.direccionSucursal}
          </Text>
          <Text style={styles.childrenWrapDownHeader2} />
        </View>

        <View style={styles.body}>
          {/* Detalles del proveedor */}
          <View style={styles.sectionProvedor}>
            <View style={styles.childrenSectionProvedor1}>
              <Text style={styles.sectionTitle}>Proveedor</Text>
              <Text>Nombre: {data.nameProvedor}</Text>
              <Text>Metodo de Pago: {data.metodoPago}</Text>
              <Text>Moneda: {data.moneda}</Text>
            </View>
            <View style={styles.childrenSectionProvedor2}>
              <Text>Direccion: {data.nameProvedor}</Text>
              <Text>Metodo de Entrega: {data.metodoPago}</Text>
              <Text>Fecha Estimada de Entrega: {data.moneda}</Text>
            </View>
          </View>

          {/* Tabla de artículos */}
          <View style={styles.table}>
            {/* Encabezados */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>CONCEPTO</Text>
              <Text style={styles.tableHeaderCell}>PRECIO</Text>
              <Text style={styles.tableHeaderCell}>CANTIDAD</Text>
              <Text style={styles.tableHeaderCell}>SUBTOTAL</Text>
            </View>

            {/* Filas de la tabla */}
            {data.items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.code}</Text>
                <Text style={styles.tableCell}>{item.price.toFixed(2)}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>
                  {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totales */}
          <View style={styles.seccionTotalesyEncargado}>
            <View style={styles.seccionEncargado}>
              <Text style={styles.lineNameEncargado}></Text>
              <Text>{data.nameEncargado}</Text>
              <Text>Responsable de Compra</Text>
            </View>

            <View style={styles.totales}>
              <Text>
                <Text style={styles.subtotal}>Sub-total:</Text>${data.subtotal}
              </Text>
              <Text style={styles.descuento}>Descuento: ${data.descuento}</Text>
              <Text style={styles.iva}>IVA(16%): ${data.tax}</Text>
              <Text style={styles.total}>Total: ${data.total}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Previsualización PDF
const PdfPreview: React.FC<{
  formData: PdfFormData;
  data: PdfEditorModalProps["data"];
}> = ({ formData, data }) => {
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);

  React.useEffect(() => {
    const generatePdf = async () => {
      const blob = await pdf(
        <PdfDocument {...formData} data={data} />
      ).toBlob();
      setPdfBlob(URL.createObjectURL(blob));
    };
    generatePdf();
  }, [formData, data]);

  if (!pdfBlob) return <SpinComponent />;

  return (
    <iframe
      src={pdfBlob}
      width="100%"
      height="500px"
      style={{ border: "none" }}
    />
  );
};

export default PdfModal;
