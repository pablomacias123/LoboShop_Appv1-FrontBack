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
  IonBackButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import './Login.css';

const Register: React.FC = () => {
  const history = useHistory();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [toast, setToast] = useState({ show: false, message: '', color: '' });

  // Validación del formulario
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { nombre: '', email: '', password: '', confirmPassword: '' };

    // Validar nombre
    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es obligatorio';
      valid = false;
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      valid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      valid = false;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Manejar registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
      });
      setToast({
        show: true,
        message: '¡Registro exitoso! Bienvenido a LoboShop',
        color: 'success',
      });
      setTimeout(() => history.push('/home'), 1000);
    } catch (error: any) {
      setToast({
        show: true,
        message: error.message || 'Error al registrarse',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Registro</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Crear Cuenta Nueva</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <Input
                    label="Nombre Completo"
                    type="text"
                    value={formData.nombre}
                    onChange={(value) =>
                      setFormData({ ...formData, nombre: value })
                    }
                    error={errors.nombre}
                    placeholder=""
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) =>
                      setFormData({ ...formData, email: value })
                    }
                    error={errors.email}
                    placeholder=""
                    required
                  />

                  <Input
                    label="Teléfono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(value) =>
                      setFormData({ ...formData, telefono: value })
                    }
                    placeholder=""
                  />

                  <Input
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(value) =>
                      setFormData({ ...formData, password: value })
                    }
                    error={errors.password}
                    placeholder=""
                    required
                  />

                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(value) =>
                      setFormData({ ...formData, confirmPassword: value })
                    }
                    error={errors.confirmPassword}
                    placeholder=""
                    required
                  />

                  <div className="ion-margin-top">
                    <Button
                      text="Crear Cuenta"
                      onClick={handleRegister}
                      loading={loading}
                      expand="block"
                    />
                  </div>

                  <div className="ion-text-center ion-margin-top">
                    <IonText color="medium">
                      ¿Ya tienes cuenta?{' '}
                      <span
                        className="link"
                        onClick={() => history.push('/login')}
                      >
                        Inicia sesión
                      </span>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
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

export default Register;
