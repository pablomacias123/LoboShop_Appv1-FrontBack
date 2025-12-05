import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [toast, setToast] = useState({ show: false, message: '', color: '' });

  // Validación del formulario
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'El email es obligatorio';
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    // Validar contraseña
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({ email, password });
      setToast({
        show: true,
        message: '¡Bienvenido a LoboShop!',
        color: 'success',
      });
      setTimeout(() => history.push('/home'), 1000);
    } catch (error: any) {
      setToast({
        show: true,
        message: error.message || 'Error al iniciar sesión',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
              <div className="login-container">
                <div className="logo-container">
                  <h1>🐺 LoboShop</h1>
                  <p>Tu tienda online de confianza</p>
                </div>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Iniciar Sesión</IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      error={errors.email}
                      placeholder=""
                      required
                    />

                    <Input
                      label="Contraseña"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      error={errors.password}
                      placeholder=""
                      required
                    />

                    <div className="ion-margin-top">
                      <Button
                        text="Iniciar Sesión"
                        onClick={handleLogin}
                        loading={loading}
                        expand="block"
                      />
                    </div>

                    <div className="ion-text-center ion-margin-top">
                      <IonText color="medium">
                        ¿No tienes cuenta?{' '}
                        <span
                          className="link"
                          onClick={() => history.push('/register')}
                        >
                          Regístrate aquí
                        </span>
                      </IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast({ ...toast, show: false })}
          message={toast.message}
          duration={3000}
          color={toast.color}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
