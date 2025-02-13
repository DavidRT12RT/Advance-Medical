const { rgb, StandardFonts } = require('pdf-lib');

function dividirTexto(texto, longitudMaxima) {
    // Primero manejamos los saltos de línea existentes
    const lineasExistentes = texto.split(/\n+/);
    const lineas = [];
    let saltosDeLinea = lineasExistentes.length - 1; // Contamos los saltos existentes

    // Procesamos cada línea existente
    for (const lineaExistente of lineasExistentes) {
        const palabras = lineaExistente.split(' ');
        let lineaActual = palabras[0] || '';

        for (let i = 1; i < palabras.length; i++) {
            const palabra = palabras[i];
            if (lineaActual.length + 1 + palabra.length <= longitudMaxima) {
                lineaActual += ' ' + palabra;
            } else {
                lineas.push(lineaActual);
                lineaActual = palabra;
                saltosDeLinea++;
            }
        }

        if (lineaActual) {
            lineas.push(lineaActual);
        }
    }

    return {
        textoDividido: lineas.join('\n'),
        saltosDeLinea: saltosDeLinea + 1, // Añadimos 1 para la última línea
    };
}
// MAÑANA CREAR UNA CLASE
const BORDER = 25;
const WIDTH_PDF = 595.5;
const HEIGHT_PDF = 842.2499787;

let x = BORDER;
let y = (HEIGHT_PDF - BORDER) - 260;//43.2 MIDE LA IMAGEN
let page;
// podria ser mejor create row esta funcion 
const createRow = async (/* page, */ {
    header = [],
    pdfDoc,
    bg,
    color,
    borderColor,
    isBorder = true
}) => {
    // Reset y position when starting with a new page
    if (!page || page !== pdfDoc.getPages()[0]) {
        y = (HEIGHT_PDF - BORDER) - 260; // Reset to initial position
    }
    // console.log('pdfDoc.getPages :>> ', pdfDoc.getPages().length);
    page = pdfDoc.getPages()[0];
    // const pdfDoc = await PDFDocument.create();
    if (!page) {
        page = pdfDoc.addPage([WIDTH_PDF, HEIGHT_PDF]);
    }

    // Cargar la fuente Helvetica-Bold
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const getWidth = () => {
        const width = (WIDTH_PDF - (BORDER * 2));
        const flex = header.reduce((a, cv) => (a + cv?.flex), 0);
        return (width / flex);
    };

    // Calcular la altura máxima de los rectángulos
    let maxAltura = 0;
    const rectangulos = header.map((head) => {
        const w = getWidth() * head.flex;
        const baseHeight = 12;

        const { textoDividido, saltosDeLinea } = dividirTexto(head.title, Math.floor(w / 6));

        const h = baseHeight * (saltosDeLinea + 1);// + 1
        if (h > maxAltura) {
            maxAltura = h;
        }

        const draw = { x, y, w, h, textoDividido, saltosDeLinea };
        x += w;
        return draw;
    });

    // Dibujar los rectángulos con la misma altura
    rectangulos.forEach(({ x, y, w, h, textoDividido, saltosDeLinea }) => {

        y -= maxAltura;
        if (isBorder) {
            page.drawRectangle({
                x: x,
                y: y,
                width: w,
                height: maxAltura,
                borderColor: borderColor ? borderColor : rgb(0, 0, 0),
                borderWidth: 1,
                color: bg ? bg : rgb(1, 1, 1),
            });
        }



        page.drawText(textoDividido, {
            x: x + 5,
            y: (y + maxAltura - 15) - (saltosDeLinea == 1 ? (maxAltura / 2) - 12 : 0),
            size: 12,
            color: color ? color : rgb(0, 0, 0),
            lineHeight: 12,
            font: color ? helveticaBoldFont : helveticaFont
        });

        x += w;
    });
    y -= maxAltura;
    x = BORDER;

    if (y < 50) {
        // console.log('4444444444444 :>> ', 4444444444444);
        y = (HEIGHT_PDF - BORDER) /* - 260 */;//43.2 MIDE LA IMAGEN
        page = pdfDoc.addPage([WIDTH_PDF, HEIGHT_PDF]);
    }


};

module.exports = { y, x, createRow };
