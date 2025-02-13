module.exports = {
  plantillas: {
    generarPlantillaHTMLRechazo: function ({
      nombrePostulante,
      nombrePuesto,
      nombreEmpresa,
      razonSeleccionada,
      nombreEncargado
    }) {
      return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificación de Candidatura</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
          }
          .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
              font-size: 24px;
              color: #333333;
          }
          p {
              font-size: 16px;
              color: #666666;
          }
          .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #999999;
          }
      </style>
    </head>
    <body>
      <div class="container">
          <h1>Estimado/a ${nombrePostulante},</h1>
          <p>
              Gracias por tu interés en el puesto de <strong>${nombrePuesto}</strong> en <strong>${nombreEmpresa}</strong>. Hemos revisado cuidadosamente tu perfil y documentos, y lamentablemente, no podremos avanzar con tu candidatura en esta ocasión.
          </p>
          <p>
              El motivo de esta decisión es el siguiente:<br>
              <strong>${razonSeleccionada}</strong>.
          </p>
          <p>
              Apreciamos el tiempo y esfuerzo que has dedicado al proceso y te animamos a seguir atento/a a futuras oportunidades con nosotros.
          </p>
          <p>
              Te deseamos mucho éxito en tus próximos proyectos.
          </p>
          <div class="footer">
              Atentamente,<br>
              <strong>${nombreEncargado}</strong><br>
              <strong>${nombreEmpresa}</strong>
          </div>
      </div>
    </body>
    </html>
    `;
    },
    generarPlantillaHTMLAprobacion: function ({
      nombrePostulante,
      fechaEntrevista,
      horaEntrevista,
      modalidadEntrevista,
      lugarOEnlaceEntrevista,
      telefonoOCorreo,
      nombreEncargado,
      nombreEmpresa
    }) {
      return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Documentos Aprobados - Próxima Entrevista</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
          }
          .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
              font-size: 24px;
              color: #333333;
          }
          p {
              font-size: 16px;
              color: #666666;
          }
          .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #999999;
          }
          .details {
              margin-top: 20px;
              padding: 10px;
              background-color: #f9f9f9;
              border-left: 4px solid #4CAF50;
          }
          .details p {
              margin: 0;
              font-size: 16px;
              color: #333333;
          }
      </style>
    </head>
    <body>
      <div class="container">
          <h1>¡Documentos aprobados! Próxima etapa: Entrevista programada</h1>
          <p>Estimado/a ${nombrePostulante},</p>
          <p>
              Nos complace informarte que tus documentos han sido revisados y aprobados. ¡Felicidades! Esto significa que tu perfil ha calificado para la siguiente etapa del proceso de selección: la entrevista.
          </p>
          <div class="details">
              <p><strong>Detalles de tu entrevista:</strong></p>
              <p>• Fecha: ${fechaEntrevista}</p>
              <p>• Hora: ${horaEntrevista}</p>
              <p>• Modalidad: ${modalidadEntrevista}</p>
              <p>• Lugar o enlace: ${lugarOEnlaceEntrevista}</p>
          </div>
          <p>
              Por favor, confirma tu asistencia a la entrevista respondiendo este correo o utilizando el enlace de confirmación. Si necesitas reagendar, no dudes en contactarnos a ${telefonoOCorreo} para coordinar una nueva fecha.
          </p>
          <p>
              Esperamos verte pronto y te deseamos mucho éxito en esta etapa.
          </p>
          <div class="footer">
              Atentamente,<br>
              <strong>${nombreEncargado}</strong><br>
              <strong>${nombreEmpresa}</strong>
          </div>
      </div>
    </body>
    </html>
      `;
    },
    generarPlantillaHTMLActualizacion: function ({
      nombrePostulante,
      nombrePuesto,
      nuevaFechaEntrevista,
      nuevaHoraEntrevista,
      modalidadEntrevista,
      nuevaDireccionOEnlaceEntrevista,
      telefonoOCorreo,
      nombreEncargado,
      nombreEmpresa
    }) {
      return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Entrevista Programada</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
          }
          .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
              font-size: 24px;
              color: #333333;
          }
          p {
              font-size: 16px;
              color: #666666;
          }
          .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #999999;
          }
          .details {
              margin-top: 20px;
              padding: 10px;
              background-color: #f9f9f9;
              border-left: 4px solid #f39c12;
          }
          .details p {
              margin: 0;
              font-size: 16px;
              color: #333333;
          }
      </style>
    </head>
    <body>
      <div class="container">
          <h1>Actualización en tu entrevista programada</h1>
          <p>Estimado/a ${nombrePostulante},</p>
          <p>
              Queremos informarte que hemos actualizado los detalles de tu entrevista para el puesto de <strong>${nombrePuesto}</strong>. A continuación, te compartimos la nueva información:
          </p>
          <div class="details">
              <p><strong>Detalles actualizados de tu entrevista:</strong></p>
              <p>• Nueva fecha: ${nuevaFechaEntrevista}</p>
              <p>• Nueva hora: ${nuevaHoraEntrevista}</p>
              <p>• Modalidad: ${modalidadEntrevista}</p>
              <p>• Lugar o enlace: ${nuevaDireccionOEnlaceEntrevista}</p>
          </div>
          <p>
              Te pedimos que confirmes tu asistencia a la entrevista respondiendo este correo o utilizando el enlace de confirmación. Si necesitas reagendar nuevamente, no dudes en contactarnos a ${telefonoOCorreo}.
          </p>
          <p>
              Gracias por tu comprensión, y esperamos verte pronto.
          </p>
          <div class="footer">
              Atentamente,<br>
              <strong>${nombreEncargado}</strong><br>
              <strong>${nombreEmpresa}</strong>
          </div>
      </div>
    </body>
    </html>
      `;
    },
    generarPlantillaHTMLContratacion: function ({
      nombrePostulante,
      nombrePuesto,
      nombreEmpresa,
      siguientePasoFirma,
      telefonoOCorreo,
      nombreEncargado
    }) {
      return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Felicitaciones! Has sido contratado/a</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
          }
          .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
              font-size: 24px;
              color: #333333;
          }
          p {
              font-size: 16px;
              color: #666666;
          }
          .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #999999;
          }
          .details {
              margin-top: 20px;
              padding: 10px;
              background-color: #f9f9f9;
              border-left: 4px solid #2ecc71;
          }
          .details p {
              margin: 0;
              font-size: 16px;
              color: #333333;
          }
      </style>
    </head>
    <body>
      <div class="container">
          <h1>¡Felicitaciones! Has sido contratado/a</h1>
          <p>Estimado/a ${nombrePostulante},</p>
          <p>
              Nos complace informarte que has sido seleccionado/a para el puesto de <strong>${nombrePuesto}</strong> en <strong>${nombreEmpresa}</strong>. ¡Felicidades por tu contratación!
          </p>
          <div class="details">
              <p><strong>Detalles sobre la firma de tu contrato:</strong></p>
              <p>${siguientePasoFirma}</p>
          </div>
          <p>
              Por favor, confirma tu asistencia a la firma respondiendo a este correo o contactándonos a ${telefonoOCorreo}. En caso de ser una firma en línea, encontrarás adjunto el documento del contrato para revisarlo con anticipación.
          </p>
          <p>
              Estamos emocionados de darte la bienvenida al equipo y te deseamos mucho éxito en este nuevo capítulo.
          </p>
          <div class="footer">
              Atentamente,<br>
              <strong>${nombreEncargado}</strong><br>
              <strong>${nombreEmpresa}</strong>
          </div>
      </div>
    </body>
    </html>
      `;
    },
    generarPlantillaHTMLAprobacionCompra: function ({
      numeroOrden,
      solicitante,
      fechaSolicitud,
      montoTotal,
      enlaceOrden,
      nombreEmpresa,
      nombreDelResponsable
    }) {
      return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aprobación de Orden de Compra</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
          }
          .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
              font-size: 24px;
              color: #333333;
          }
          p {
              font-size: 16px;
              color: #666666;
          }
          .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #999999;
          }
          .details {
              margin-top: 20px;
              padding: 10px;
              background-color: #f9f9f9;
              border-left: 4px solid #007bff;
          }
          .details p {
              margin: 0;
              font-size: 16px;
              color: #333333;
          }
          .btn {
              background: #007bff;
              color: #ffffff;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
          }
      </style>
    </head>
    <body>
      <div class="container">
          <h1>¡Hola ${nombreDelResponsable}! Tienes una nueva solicitud de compra pendiente de aprobación</h1>
          <div class="details">
              <p><strong>Número de Orden:</strong> ${numeroOrden}</p>
              <p><strong>Solicitante:</strong> ${solicitante}</p>
              <p><strong>Fecha:</strong> ${fechaSolicitud}</p>
              <p><strong>Monto Total:</strong> ${montoTotal}</p>
          </div>
          <p>
              Por favor revise los detalles de la orden:
          </p>
          <a href="${enlaceOrden}" class="btn" style="color: white!important">Ver Orden de Compra</a>
          <div class="footer">
              <p>Mensaje automático - No responder<br><strong>${nombreEmpresa}</strong></p>
          </div>
      </div>
    </body>
    </html>
      `;
    },
    generarPlantillaHTMLEmpresaAceptada: function ({
      nombreContactoPrincipal,
      nombreEmpresa,
      linkInicioSesion
    }) {
      return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Enhorabuena! Su Empresa ha sido Aceptada en SMART ROUTE</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                font-size: 24px;
                color: #333333;
            }
            p {
                font-size: 16px;
                color: #666666;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #999999;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffffff;
                background-color: #28a745;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
      </head>
      <body>
        <div class="container">
            <h1>¡Enhorabuena!</h1>
            <p>
                Estimado/a ${nombreContactoPrincipal},
            </p>
            <p>
                Nos complace informarle que su empresa, <strong>${nombreEmpresa}</strong>, ha sido aceptada exitosamente en la plataforma <strong>SMART ROUTE</strong>.
            </p>
            <p>
                A partir de ahora, podrá acceder a todas las funcionalidades y ventajas que ofrecemos para ayudarle a optimizar sus procesos, mejorar la eficiencia de su equipo y potenciar el crecimiento de su empresa.
            </p>
            <p>
                Puede iniciar sesión utilizando sus credenciales en el siguiente enlace:<br>
                <a href="${linkInicioSesion}" class="button" style="color: white!important">Iniciar Sesión en SMART ROUTE</a>
            </p>
            <p>
                Si tiene alguna duda o requiere asistencia para comenzar, no dude en ponerse en contacto con nuestro equipo de soporte.
            </p>
            <p>
                ¡Bienvenido/a a SMART ROUTE! Estamos emocionados de trabajar con usted y contribuir al éxito de su empresa.
            </p>
            <div class="footer">
                Atentamente,<br>
                <strong>Equipo SMART ROUTE</strong><br>
                soporte@smartroute.com
            </div>
        </div>
      </body>
      </html>
      `;
    },
    generarPlantillaHTMLRegistroRechazo: function ({
      nombreContactoPrincipal,
      nombreEmpresa,
      motivoRechazo
    }) {
      return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Información sobre el Proceso de Registro en SMART ROUTE</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                font-size: 24px;
                color: #333333;
            }
            p {
                font-size: 16px;
                color: #666666;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #999999;
            }
            .reason {
                font-weight: bold;
                color: #e74c3c;
            }
        </style>
      </head>
      <body>
        <div class="container">
            <h1>Información sobre el Proceso de Registro</h1>
            <p>
                Estimado/a ${nombreContactoPrincipal},
            </p>
            <p>
                Gracias por su interés en registrar su empresa, <strong>${nombreEmpresa}</strong>, en la plataforma <strong>SMART ROUTE</strong>.
            </p>
            <p>
                Lamentablemente, después de revisar la información y documentación proporcionada, hemos decidido <strong>rechazar</strong> su solicitud de registro por la siguiente razón:
            </p>
            <p class="reason">
                Motivo del Rechazo: ${motivoRechazo}
            </p>
            <p>
                Le sugerimos revisar la documentación enviada o corregir los detalles mencionados anteriormente. Si cree que ha habido un error o desea volver a enviar su solicitud, no dude en ponerse en contacto con nuestro equipo para obtener más información.
            </p>
            <p>
                Agradecemos su comprensión y quedamos a su disposición para futuras consultas o solicitudes.
            </p>
            <div class="footer">
                Atentamente,<br>
                <strong>Equipo SMART ROUTE</strong><br>
                soporte@smartroute.com
            </div>
        </div>
      </body>
      </html>
      `;
    },
    generarPlantillaHTMLSolicitudFactura: function ({
      numeroOrden,
      nombreProveedor,
      productos,
      nombreResponsable,
      nombreEmpresa
    }) {
      // Convertir la lista de productos en formato HTML
      const listaProductosHTML = productos.map(producto => 
        `<li>${producto.descripcion} - Cantidad: ${producto.cantidad} Subtotal: ${producto.subtotal}</li>`
      ).join('');

      return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud de Factura y Envío</title>
        <style>
            body{font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4}
            .container{max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1)}
            h1{color:#333;font-size:24px;margin-bottom:20px}
            .details{background:#f8f9fa;padding:15px;border-radius:4px;margin:15px 0}
            .products{list-style-type:none;padding-left:0}
            .products li{padding:8px 0;border-bottom:1px solid #eee}
            .footer{margin-top:30px;padding-top:20px;border-top:1px solid #eee;color:#666}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Solicitud de Factura y Envío para Orden de Compra ${numeroOrden}</h1>
            
            <p>Estimado/a ${nombreProveedor},</p>
            
            <p>Nos dirigimos a usted para coordinar el envío de los productos y solicitar la factura correspondiente a nuestra orden de compra ${numeroOrden}, recientemente aprobada.</p>
            
            <div class="details">
                <h2>Detalles de la orden:</h2>
                <p><strong>Número de Orden:</strong> ${numeroOrden}</p>
                <p><strong>Productos:</strong></p>
                <ul class="products">
                    ${listaProductosHTML}
                </ul>
            </div>

            <p>Le agradeceríamos que nos enviara la factura en este mismo hilo de correo y nos informara sobre la fecha estimada de llegada de los productos. Si tiene alguna pregunta o necesita realizar alguna modificación, no dude en responder a este correo.</p>

            <div class="footer">
                <p>Atentamente,<br>
                <strong>${nombreResponsable}</strong><br>
                <strong>${nombreEmpresa}</strong></p>
            </div>
        </div>
    </body>
    </html>`;
    },
    generarPlantillaHTMLRechazoOrdenCompra: function ({
      numeroOrden,
      nombreCreador,
      razonRechazo,
      enlaceOrden,
      nombreEmpresa
    }) {
      return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orden de Compra Rechazada</title>
        <style>
            body{font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4}
            .container{max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1)}
            h1{color:#333;font-size:24px;margin-bottom:20px}
            .reason{background:#fff3f3;padding:15px;border-radius:4px;margin:15px 0;border-left:4px solid #dc3545}
            .button{display:inline-block;background:#0056b3;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;margin:15px 0}
            .footer{margin-top:30px;padding-top:20px;border-top:1px solid #eee;color:#666}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Revisión Requerida: Orden de Compra ${numeroOrden} Rechazada</h1>
            
            <p>Estimado/a ${nombreCreador},</p>
            
            <p>Lamentamos informarle que la orden de compra ${numeroOrden} ha sido rechazada.</p>
            
            <div class="reason">
                <p><strong>Razón del rechazo:</strong><br>
                ${razonRechazo}</p>
            </div>

            <p>Por favor, revise los detalles y realice las modificaciones necesarias. Una vez actualizada, puede volver a enviar la orden para su aprobación.</p>

            <a href="${enlaceOrden}" class="button" style="color:white!important">Ver Orden de Compra</a>

            <div class="footer">
                <p>Este es un mensaje automático del sistema de compras.<br>
                <strong>${nombreEmpresa}</strong></p>
            </div>
        </div>
    </body>
    </html>`;
    },
    generarPlantillaHTMLNuevoUsuario: function ({
      nombreColaborador,
      correoElectronico,
      contrasenaTemp,
      nombreEmpresa,
      linkInicioSesion
    }) {
      return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a ${nombreEmpresa}</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
          }
          .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              max-width: 600px;
              margin: 0 auto;
          }
          h1 {
              font-size: 24px;
              color: #333;
              margin-bottom: 20px;
          }
          .credentials-box {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              padding: 15px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
          }
          p {
              color: #666;
              line-height: 1.6;
          }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>¡Bienvenido a ${nombreEmpresa}!</h1>
        <p>Hola ${nombreColaborador},</p>
        <p>Tu cuenta ha sido creada exitosamente en nuestra plataforma. A continuación, encontrarás tus credenciales de acceso:</p>
        
        <div class="credentials-box">
          <p><strong>Correo electrónico:</strong> ${correoElectronico}</p>
          <p><strong>Contraseña temporal:</strong> ${contrasenaTemp}</p>
        </div>

        <p>Por razones de seguridad, te recomendamos cambiar tu contraseña en tu primer inicio de sesión.</p>
        
        <p>Para acceder a la plataforma, haz clic en el siguiente enlace:</p>
        <a href="${linkInicioSesion}" class="button">Iniciar Sesión</a>

        <p style="margin-top: 30px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al equipo de soporte.</p>
        
        <p>¡Bienvenido al equipo!</p>
        <p>Atentamente,<br>El equipo de ${nombreEmpresa}</p>
      </div>
    </body>
    </html>
    `;
    },
  }
}
