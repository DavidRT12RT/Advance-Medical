/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require('nodemailer');
const cors = require('cors');
const express = require("express");

const { plantillas } = require("./utils/plantillas");
const recursosHumanos = require("./rutas/recursosHumanos");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json()); // Para parsear JSON en los requests

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
var transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: false,
  auth: {
    user: 'cloud.send.email@gmail.com',
    pass: 'qacywznatgzedfmx'
  }
});

// Configura CORS
const corsOptions = {
  origin: true, // Permitir todos los orígenes. Cambia esto a un dominio específico si es necesario.
};

recursosHumanos(app);

exports.helloWorld = onRequest((request, response) => {

  cors(corsOptions)(request, response, async () => {
    if (request.method == "POST") {
      const {
        to,
        subject,
        plantilla,
        ...data
      } = request.body; // Recibimos los datos desde el request

      try {
        var options = {
          from: `cloud.send.email@gmail.com smartroute`,
          to: to,
          subject: subject,//'Notificación sobre tu candidatura',
          html: plantillas[plantilla](data),
          attachments: []
        };
        // Enviamos el correo
        await transporter.sendMail(options);
        // logger.info("Hello logs!", { structuredData: true });
        // Devolvemos un JSON con un mensaje de éxito y detalles
        response.status(200).json({
          success: true,
          message: 'Correo enviado con éxito',
          details: {
            /* to: to,
            subject: subject, */
          }
        });
      } catch (error) {
        console.error('Error al enviar el correo:', error);

        // Devolvemos un JSON con un mensaje de error y el detalle del error
        response.status(500).json({
          success: false,
          message: 'Error al enviar el correo',
          error: error.toString()
        });
      }
    } else {
      response.status(405).send({ error: 'Método no permitido' });
    }
  });

});

exports.recursosHumanos = onRequest(app);
