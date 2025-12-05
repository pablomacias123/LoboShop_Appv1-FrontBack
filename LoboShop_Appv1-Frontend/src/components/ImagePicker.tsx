import React, { useState, useRef } from 'react';
import {
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonFabButton,
  IonAlert,
} from '@ionic/react';
import { closeCircle, imagesOutline } from 'ionicons/icons';
import './ImagePicker.css';

interface ImagePickerProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      setAlertMessage(`Solo puedes subir un máximo de ${maxImages} imágenes`);
      setShowAlert(true);
      return;
    }

    // Validar tamaño y tipo de archivos
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setAlertMessage('Solo se permiten archivos de imagen');
        setShowAlert(true);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setAlertMessage('Las imágenes no pueden superar los 5MB');
        setShowAlert(true);
        return false;
      }
      return true;
    });

    onImagesChange([...images, ...validFiles]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-picker-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden-input"
      />

      {images.length < maxImages && (
        <div className="add-image-section">
          <IonButton expand="block" onClick={openFilePicker}>
            <IonIcon icon={imagesOutline} slot="start" />
            Seleccionar Imágenes ({images.length}/{maxImages})
          </IonButton>
        </div>
      )}

      {images.length > 0 && (
        <IonGrid>
          <IonRow>
            {images.map((image, index) => (
              <IonCol size="6" sizeMd="4" key={index}>
                <div className="image-preview-container">
                  <IonImg
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="image-preview"
                  />
                  <IonFabButton
                    size="small"
                    color="danger"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    <IonIcon icon={closeCircle} />
                  </IonFabButton>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      )}

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Error"
        message={alertMessage}
        buttons={['OK']}
      />
    </div>
  );
};

export default ImagePicker;
