import React from 'react';
import { IonButton, IonSpinner } from '@ionic/react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  expand?: 'full' | 'block';
  color?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  loading = false,
  disabled = false,
  expand = 'block',
  color = 'primary',
}) => {
  return (
    <IonButton
      expand={expand}
      color={color}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <IonSpinner name="crescent" /> : text}
    </IonButton>
  );
};

export default Button;
