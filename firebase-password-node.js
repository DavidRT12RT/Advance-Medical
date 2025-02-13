const { initializeApp } = require('firebase/app');
const { getAuth, updatePassword, signInWithEmailAndPassword } = require('firebase/auth');

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    // ... otras configuraciones
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Función para cambiar la contraseña
async function cambiarContraseña(email, contraseñaActual, nuevaContraseña) {
    try {
        // Primero, reautenticar al usuario
        const credencial = await signInWithEmailAndPassword(auth, email, contraseñaActual);
        const usuario = credencial.user;

        // Cambiar la contraseña
        await updatePassword(usuario, nuevaContraseña);
        console.log('Contraseña actualizada exitosamente');
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error.message);
        throw error;
    }
}

// Ejemplo de uso
// cambiarContraseña('usuario@ejemplo.com', 'contraseñaActual123', 'nuevaContraseña123');
