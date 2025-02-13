export async function enviarEmail(datos: any) {
  try {
    const response = await fetch('https://helloworld-ze5xm3kxpq-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error('Error al enviar los datos');
    }

    const data = await response.text();
    console.log('Respuesta del servidor:', data);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
