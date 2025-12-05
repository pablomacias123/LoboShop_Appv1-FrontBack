import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
  IonIcon,
} from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { Category } from '../types/product.types';
import ImagePicker from '../components/ImagePicker';
import './CreateProduct.css';

const CreateProduct: React.FC = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    estado: 'nuevo' as 'nuevo' | 'usado' | 'como_nuevo',
    telefono: '',
    whatsapp: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });
  const [errors, setErrors] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getAll();
      setCategories(cats);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setToast({
        show: true,
        message: 'Error al cargar categorías',
        color: 'danger',
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = {
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: '',
    };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
      valid = false;
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
      valid = false;
    }

    const precio = parseFloat(formData.precio);
    if (!formData.precio || isNaN(precio) || precio <= 0) {
      newErrors.precio = 'Ingresa un precio válido';
      valid = false;
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setToast({
        show: true,
        message: 'Por favor completa todos los campos obligatorios',
        color: 'warning',
      });
      return;
    }

    setLoading(true);

    try {
      // Crear FormData para enviar con imágenes
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('estado', formData.estado);
      
      const contacto = {
        telefono: formData.telefono,
        whatsapp: formData.whatsapp,
      };
      formDataToSend.append('contacto', JSON.stringify(contacto));

      // Agregar imágenes
      images.forEach((image) => {
        formDataToSend.append('imagenes', image);
      });

      console.log('Enviando producto...');
      const producto = await productService.create(formDataToSend);
      console.log('Producto creado:', producto);

      setToast({
        show: true,
        message: '¡Producto publicado exitosamente!',
        color: 'success',
      });

      setTimeout(() => {
        history.push('/productos');
      }, 1500);
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'Error al publicar producto',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={true} message="Cargando..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>Publicar Producto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información del Producto</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            {/* Nombre */}
            <IonItem className={errors.nombre ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">
                Nombre del Producto <span className="required-field-marker">*</span>
              </IonLabel>
              <IonInput
                value={formData.nombre}
                placeholder="Ej: iPhone 13 Pro"
                onIonChange={(e) =>
                  setFormData({ ...formData, nombre: e.detail.value! })
                }
              />
            </IonItem>
            {errors.nombre && (
              <div className="error-message">{errors.nombre}</div>
            )}

            {/* Descripción */}
            <IonItem className={errors.descripcion ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">
                Descripción <span className="required-field-marker">*</span>
              </IonLabel>
              <IonTextarea
                value={formData.descripcion}
                placeholder="Describe tu producto..."
                rows={4}
                onIonChange={(e) =>
                  setFormData({ ...formData, descripcion: e.detail.value! })
                }
              />
            </IonItem>
            {errors.descripcion && (
              <div className="error-message">{errors.descripcion}</div>
            )}

            {/* Precio */}
            <IonItem className={errors.precio ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">
                Precio (MXN) <span className="required-field-marker">*</span>
              </IonLabel>
              <IonInput
                type="number"
                value={formData.precio}
                placeholder="0.00"
                onIonChange={(e) =>
                  setFormData({ ...formData, precio: e.detail.value! })
                }
              />
            </IonItem>
            {errors.precio && (
              <div className="error-message">{errors.precio}</div>
            )}

            {/* Categoría */}
            <IonItem className={errors.categoria ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">
                Categoría <span className="required-field-marker">*</span>
              </IonLabel>
              <IonSelect
                value={formData.categoria}
                placeholder="Selecciona una categoría"
                onIonChange={(e) =>
                  setFormData({ ...formData, categoria: e.detail.value! })
                }
              >
                {categories.map((cat) => (
                  <IonSelectOption key={cat._id} value={cat._id}>
                    {cat.nombre}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            {errors.categoria && (
              <div className="error-message">{errors.categoria}</div>
            )}

            {/* Estado */}
            <IonItem>
              <IonLabel position="stacked">Estado del Producto</IonLabel>
              <IonSelect
                value={formData.estado}
                onIonChange={(e) =>
                  setFormData({ ...formData, estado: e.detail.value! })
                }
              >
                <IonSelectOption value="nuevo">Nuevo</IonSelectOption>
                <IonSelectOption value="como_nuevo">Como Nuevo</IonSelectOption>
                <IonSelectOption value="usado">Usado</IonSelectOption>
              </IonSelect>
            </IonItem>

            {/* Teléfono */}
            <IonItem>
              <IonLabel position="stacked">Teléfono de Contacto</IonLabel>
              <IonInput
                type="tel"
                value={formData.telefono}
                placeholder="4491234567"
                onIonChange={(e) =>
                  setFormData({ ...formData, telefono: e.detail.value! })
                }
              />
            </IonItem>

            {/* WhatsApp */}
            <IonItem>
              <IonLabel position="stacked">WhatsApp</IonLabel>
              <IonInput
                type="tel"
                value={formData.whatsapp}
                placeholder="4491234567"
                onIonChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.detail.value! })
                }
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Selector de imágenes */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Imágenes (Opcional)</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ImagePicker
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </IonCardContent>
        </IonCard>

        {/* Botón de publicar */}
        <IonButton
          expand="block"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="publish-button"
        >
          <IonIcon icon={checkmarkCircleOutline} slot="start" />
          {loading ? 'Publicando...' : 'Publicar Producto'}
        </IonButton>

        <IonLoading isOpen={loading} message="Publicando producto..." />

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

export default CreateProduct;
