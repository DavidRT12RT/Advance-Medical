const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fetch = require('node-fetch');
const { createRow, y, x } = require('../utils/pdf');


function hexToRgb(hex, isOpacity = false) {
  // Convertir hex a valores RGB
  const bigint = parseInt(hex.slice(1), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  // Si isOpacity es true, aclaramos el color
  if (isOpacity) {
    const factor = 0.75; // Factor de aclarado, puedes ajustar este valor (mayor a 1 para aclarar)
    r = Math.min(255, r * factor); // Limitar el valor a 255 para evitar overflow
    g = Math.min(255, g * factor);
    b = Math.min(255, b * factor);
  }

  return rgb(r / 255, g / 255, b / 255);
}

function generarColorHex() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

const getComments = async (limit) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/comments?_limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return await response.json();

};
// Definimos la función recursosHumanos
function recursosHumanos(app) {

  app.post("/crearCuenta", async (req, res) => {
    // Obtener la información del usuario desde el cliente
    const {
      email,
      password,
      displayName,
      ...data
    } = req.body

    try {
      // Crear el usuario en Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: displayName,
      });

      // Regresar el UID del nuevo usuario
      res.status(200).json({
        success: true,
        data: userRecord,
        error: null,
      });
    } catch (error) {
      // Manejo de errores
      console.error("Error al listar usuarios:", error);
      res.status(500).json({
        success: false,
        data: {},
        error: error.toString(),
      });
    }
  });
  // Endpoint: /listarColaboradores
  app.get("/listarColaboradores", async (req, res) => {
    try {
      // Capturamos los parámetros enviados en la URL
      const { idEmpresa = "", search = "", limit = 10, skip = 0 } = req.query;

      // Inicializamos la referencia a la colección
      let usuariosRef = db.collection('usuarios').orderBy('fechaRegistro', 'desc');

      // Condicionamos si 'idEmpresa' tiene valor
      if (idEmpresa) {
        // Si idEmpresa tiene valor, agregamos el filtro 'where'
        usuariosRef = usuariosRef.where('idEmpresa', '==', idEmpresa);
      }

      const snapshot = await usuariosRef.get();
      let count = 0;
      // Extraemos los datos de los documentos
      const listaDeUsuarios = (snapshot.docs || []).map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      count = (listaDeUsuarios || []).length;

      // Filtramos si hay search
      let items = [...listaDeUsuarios];
      if (search) {
        items = listaDeUsuarios.filter(({ nombres, apellidos }) => {
          return [
            new RegExp(search, "i").test(nombres),
            new RegExp(search, "i").test(apellidos)
          ].some(v => v);
        });
        count = (items || []).length;
      }

      // Enviamos la respuesta con los datos de los usuarios
      res.status(200).json({
        success: true,
        data: items.splice(Number(skip) * limit, limit),
        error: null,
        count
      });

    } catch (error) {
      console.error("Error al listar usuarios:", error);
      res.status(500).json({
        success: false,
        data: [],
        error: error.toString(),
        count: 0
      });
    }
  });

  // Endpoint: /listarContrataciones
  app.get("/listarContrataciones", async (req, res) => {
    try {
      // Lógica para listar tareas
      res.status(200).json({
        success: true,
        data: ["Tarea1", "Tarea2"], // Ejemplo de respuesta
      });
    } catch (error) {
      console.error("Error al listar tareas:", error);
      res.status(500).json({
        success: false,
        message: "Error al listar tareas",
        error: error.toString(),
      });
    }
  });

  app.get("/dynamic-pdf", async (req, res) => {

    /* const fs = require('fs')
    const existingPdfBytes = fs.readFileSync("./Blue and Yellow Modern Business Invoice-3.pdf");
    const pdfDoc2 = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc2.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
  // "width":595.5,"height":842.2499787 // A4
    return res.json({ width, height }) */
    // enviar el id de la compra o de la orden y consultar desde aqui

    const { widthPDF, heightPDF } = { widthPDF: 595.5, heightPDF: 842.2499787 };

    const [primaryColorHex, secondaryColorHex] = [generarColorHex(), generarColorHex()];
    const { primaryColor, secondaryColor } = {
      primaryColor: hexToRgb(primaryColorHex),// blue black
      secondaryColor: hexToRgb(secondaryColorHex),// gold
    };

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([widthPDF, heightPDF]);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);


    page.drawRectangle({
      x: 0,
      y: page.getHeight() - 25,
      width: widthPDF / 2,
      height: 25,
      color: rgb(1, 1, 1),// rectangulo blanco
    });

    page.drawRectangle({
      x: page.getWidth() / 2,
      y: page.getHeight() - 25,
      width: widthPDF / 2,
      height: 25,
      color: secondaryColor,// rectangulo color dinámico
    });

    // TRIANGULO
    page.moveTo(0, page.getHeight());
    page.drawSvgPath(`M ${(page.getWidth() / 2) - 10},0 L ${(page.getWidth() / 2) + 10},0 L ${(page.getWidth() / 2)},25 Z`, {
      color: hexToRgb(secondaryColorHex, true), // Color de relleno (azul)
    });

    page.drawRectangle({
      x: 0,
      y: page.getHeight() - 235,
      width: widthPDF,
      height: 210,
      borderColor: primaryColor,
      borderWidth: 2,
      color: primaryColor,// rectangulo color dinámico
    });

    // RECTANGULO 1
    const unTercio = widthPDF / 3;
    page.drawSvgPath(`M 0,210 L ${unTercio * 2},210 L ${(unTercio * 2) + 20},260 L 0,260 Z`, {
      borderColor: rgb(1, 1, 1), // Color del borde (blanco)
      borderWidth: 2,
      color: secondaryColor, // Color de relleno (azul)
    });

    // RECTANGULO 2
    page.moveTo((unTercio * 2), page.getHeight());
    page.drawSvgPath(`M 10,210 L 25,210 L 45,260 L 30,260 Z`, {
      borderColor: rgb(1, 1, 1), // Color del borde (blanco)
      borderWidth: 2,
      color: secondaryColor, // Color de relleno (azul)
    });

    // RECTANGULO 3
    page.moveTo((unTercio * 2) + 25, page.getHeight());
    page.drawSvgPath(`M 10,210 L 25,210 L 45,260 L 30,260 Z`, {
      borderColor: rgb(1, 1, 1), // Color del borde (blanco)
      borderWidth: 2,
      color: secondaryColor, // Color de relleno (azul)
    });

    page.drawText("Responsable:", {
      x: 50,
      y: page.getHeight() - 160,
      size: 12,
      color: /* color ? color :  */rgb(1, 1, 1),
      lineHeight: 12,
      font: /* color ? helveticaBoldFont :  */helveticaFont
    });

    page.drawText("Hamer albarran valderrama", {
      x: 50,
      y: page.getHeight() - 184,
      size: 12,
      color: /* color ? color :  */rgb(1, 1, 1),
      lineHeight: 12,
      font: /* color ? helveticaBoldFont :  */helveticaFont
    });

    page.drawText("ORDEN DE COMPRA", {
      x: page.getWidth() / 1.6,
      y: page.getHeight() - 100,
      size: 12 * 1.5,
      color: /* color ? color :  */secondaryColor,
      lineHeight: 12,
      font: /* color ? helveticaBoldFont :  */helveticaBoldFont
    });

    page.drawText(`Folio: 000001`, {
      x: page.getWidth() / 1.6,
      y: page.getHeight() - 136,
      size: 12,
      color: /* color ? color :  */rgb(1, 1, 1),
      lineHeight: 12,
      font: /* color ? helveticaBoldFont :  */helveticaFont
    });

    page.drawText(`Sucursal: Jalisco II`, {
      x: page.getWidth() / 1.6,
      y: page.getHeight() - 160,
      size: 12,
      color: /* color ? color :  */rgb(1, 1, 1),
      lineHeight: 12,
      font: /* color ? helveticaBoldFont :  */helveticaFont
    });
    page.drawText(`Fecha: ${new Date().toLocaleDateString()}`, {
      x: page.getWidth() / 1.6,
      y: page.getHeight() - 184,
      size: 12,
      color: /* color ? color :  */rgb(1, 1, 1),
      lineHeight: 12,
      font: /* color ? helveticaBoldFont :  */helveticaFont
    });



    page.drawText(`Jalisco II Sección, Tonalá, Jal., México`, {
      x: 50,
      y: page.getHeight() - 240,
      size: 12,
      color: /* color ? color :  */rgb(1, 1, 1),
      lineHeight: 12,
      font: /* color ? helveticaBoldFont :  */helveticaBoldFont
    });

    // await new Promise((resolve) => setTimeout(resolve, 1000));


    createRow({
      header: [{ title: "PROVEEDOR", flex: 1 }],
      pdfDoc,
      bg: rgb(1, 1, 1),
      color: rgb(0, 0, 0),
      isBorder: false
    });

    createRow({
      header: [{ title: `Nombre: Centro Jalisco II`, flex: 1 }, { title: `Dirección: Jalisco II Sección, Tonalá, Jal., México`, flex: 1 }],
      pdfDoc,
      isBorder: false
    });
    createRow({
      header: [{ title: `Método de pago: Efectivo`, flex: 1 }, { title: `Método de entrega: Domicilio`, flex: 1 }],
      pdfDoc,
      isBorder: false
    });
    createRow({
      header: [{ title: `moneda: Pesos MXM`, flex: 1 }, { title: `Fecha estimada de entrega: ${new Date().toLocaleDateString()}`, flex: 1 }],
      pdfDoc,
      isBorder: false
    });

    createRow({
      header: [
        { title: "CONCEPTO", flex: 2 },
        { title: "PRECIO", flex: 1 },
        { title: "CANTIDAD", flex: 1 },
        { title: "SUBTOTAL", flex: 1 },
      ],
      pdfDoc,
      bg: primaryColor,
      color: rgb(1, 1, 1),
      borderColor: primaryColor
    });

    const todos = await getComments(Math.floor(Math.random() * 50));

    todos.forEach(({ name }, index) => {
      const precio = ((index + 1) * 100).toFixed(2);
      const cantidad = Math.floor(Math.random() * 10);
      createRow({
        header: [
          { title: name, flex: 2 },
          { title: `$${precio}`, flex: 1 },
          { title: `${cantidad}`, flex: 1 },
          { title: `$${(precio * cantidad).toFixed(2)}`, flex: 1 },
        ],
        pdfDoc,
        // bg: primaryColor,
        // color: rgb(1, 1, 1),
        // borderColor: primaryColor
      });
    });



    // al final agrego las imagenes para no malograr mi funcion de crear tablas 
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/smartroute-ca317.appspot.com/o/reservas_cronos.png?alt=media&token=d2166d25-642e-4e4b-b4f7-42cc8e25a377'
    const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const image = await pdfDoc.embedPng(imageBytes);
    // Obtener las dimensiones de la imagen
    const { width, height } = image.scale(0.2); // Puedes ajustar el tamaño de la imagen

    // Recorrer todas las páginas y dibujar la imagen en cada una
    const pages = pdfDoc.getPages();
    // pages.forEach((page) => {
    pages[0].drawImage(image, {
      x: 50,        // Posición X de la imagen
      y: page.getHeight() - (height + 35), // Posición Y de la imagen (ajusta según necesites)
      width,        // Ancho de la imagen
      height,       // Altura de la imagen
    });
    // });

    // Finalmente, guarda el documento PDF
    const pdfBytes = await pdfDoc.save();

    /* res.setHeader('Content-Disposition', 'attachment; filename="nombre_del_archivo.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.end(Buffer.from(pdfBytes)); */


    res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader("Content-Disposition", "attachment; filename=dynamically_generated.pdf");

    res.end(Buffer.from(pdfBytes));

  });
}

// Exportamos la función recursosHumanos usando module.exports
module.exports = recursosHumanos;
