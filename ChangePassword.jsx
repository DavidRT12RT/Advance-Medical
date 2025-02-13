import React, { useState } from 'react';
import { getAuth, updatePassword, signInWithEmailAndPassword } from 'firebase/auth';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const auth = getAuth();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Reautenticar al usuario
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No hay usuario autenticado');
            }

            // Verificar la contraseña actual
            await signInWithEmailAndPassword(auth, user.email, currentPassword);

            // Cambiar la contraseña
            await updatePassword(user, newPassword);
            
            setMessage('Contraseña actualizada exitosamente');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            setError('Error al cambiar la contraseña: ' + error.message);
        }
    };

    return (
        <div className="change-password-container">
            
            <form onSubmit={handleChangePassword}>
                <div>
                    <label>Contraseña Actual:</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                
                <div>
                    <label>Nueva Contraseña:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Cambiar Contraseña</button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default ChangePassword;
