import React from 'react';
import { IonInput, IonItem, IonLabel, IonText } from '@ionic/react';
import './Input.css';

interface InputProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'tel';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Componente Input reutilizable con validación
 * @param label - Etiqueta del campo
 * @param type - Tipo de input (text, email, password, tel)
 * @param value - Valor del input
 * @param onChange - Función callback cuando cambia el valor
 * @param error - Mensaje de error a mostrar
 * @param placeholder - Texto placeholder
 * @param required - Si el campo es requerido
 */
const Input: React.FC<InputProps> = ({
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  required = false,
}) => {
  return (
    <>
      <IonItem className={error ? 'ion-invalid' : ''}>
        <IonLabel position="floating">
          {label} {required && <span className="input-required">*</span>}
        </IonLabel>
        <IonInput
          type={type}
          value={value}
          placeholder={placeholder}
          onIonChange={(e) => onChange(e.detail.value!)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${label}-error` : undefined}
        />
      </IonItem>
      {error && (
        <IonText color="danger" className="input-error" id={`${label}-error`}>
          <small>{error}</small>
        </IonText>
      )}
    </>
  );
};

export default Input;
