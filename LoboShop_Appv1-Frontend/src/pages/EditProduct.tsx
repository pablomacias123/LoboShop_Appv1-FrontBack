import React, { useState, useEffect } from 'react';
import './CreateProduct.css';
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
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonFabButton,
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircle, imagesOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { Category } from '../types/product.types';
import './CreateProduct.css';

interface EditProductParams {
  id: string;
}

const EditProduct: React.FC = () => {
  const { id } = useParams<EditProductParams>();
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

  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });
  const [errors, setErrors] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Cargar categorías
      const cats = await categoryService.getAll();
      setCategories(cats);

      // Cargar producto
      const product = await productService.getById(id);
      
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio.toString(),
        categoria: product.categoria._id,
        estado: product.estado,
        telefono: product.contacto?.telefono || '',
        whatsapp: product.contacto?.whatsapp || '',
      });

      setExistingImages(product.imagenes || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setToast({
        show: true,
        message: 'Error al cargar el producto',
        color: 'danger',
      });
      setTimeout(() => history.push('/mis-productos'), 2000);
    } finally {
      setLoadingData(false);
    }
  };

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      setToast({
        show: true,
        message: 'Solo puedes tener máximo 5 imágenes',
        color: 'warning',
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setToast({
          show: true,
          message: 'Solo se permiten archivos de imagen',
          color: 'warning',
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          show: true,
          message: 'Las imágenes no pueden superar los 5MB',
          color: 'warning',
        });
        return false;
      }
      return true;
    });

    setNewImages([...newImages, ...validFiles]);
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      await productService.deleteImage(id, imageId);
      setExistingImages(existingImages.filter(img => img._id !== imageId));
      setToast({
        show: true,
        message: 'Imagen eliminada',
        color: 'success',
      });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      setToast({
        show: true,
        message: 'Error al eliminar la imagen',
        color: 'danger',
      });
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
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

      // Agregar nuevas imágenes
      newImages.forEach((image) => {
        formDataToSend.append('imagenes', image);
      });

      await productService.update(id, formDataToSend);

      setToast({
        show: true,
        message: '¡Producto actualizado exitosamente!',
        color: 'success',
      });

      setTimeout(() => {
        history.push(`/producto/${id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error al actualizar producto:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'Error al actualizar producto',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={true} message="Cargando producto..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/producto/${id}`} />
          </IonButtons>
          <IonTitle>Editar Producto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información del Producto</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
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

        {/* Gestión de imágenes */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Imágenes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Imágenes existentes */}
            {existingImages.length > 0 && (
              <>
                <h4>Imágenes actuales:</h4>
                <IonGrid>
                  <IonRow>
                    {existingImages.map((img) => (
                      <IonCol size="6" sizeMd="4" key={img._id}>
                        <div className="image-preview-container">
                          <IonImg
                            src={`http://localhost:3000${img.url}`}
                            alt="Producto"
                            className="image-preview"
                          />
                          <IonFabButton
                            size="small"
                            color="danger"
                            className="remove-image-btn"
                            onClick={() => removeExistingImage(img._id)}
                          >
                            <IonIcon icon={closeCircle} />
                          </IonFabButton>
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </>
            )}

            {/* Nuevas imágenes */}
            {newImages.length > 0 && (
              <>
                <h4>Nuevas imágenes:</h4>
                <IonGrid>
                  <IonRow>
                    {newImages.map((image, index) => (
                      <IonCol size="6" sizeMd="4" key={index}>
                        <div className="image-preview-container">
                          <IonImg
                            src={URL.createObjectURL(image)}
                            alt={`Nueva ${index + 1}`}
                            className="image-preview"
                          />
                          <IonFabButton
                            size="small"
                            color="danger"
                            className="remove-image-btn"
                            onClick={() => removeNewImage(index)}
                          >
                            <IonIcon icon={closeCircle} />
                          </IonFabButton>
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </>
            )}

            {/* Botón para agregar más imágenes */}
            {(existingImages.length + newImages.length) < 5 && (
              <>
                <input
                  type="file"
                  id="file-input"
                  onChange={handleNewImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden-input"
                />
                <IonButton
                  expand="block"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <IonIcon icon={imagesOutline} slot="start" />
                  Agregar Imágenes ({existingImages.length + newImages.length}/5)
                </IonButton>
              </>
            )}
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="publish-button"
        >
          <IonIcon icon={checkmarkCircleOutline} slot="start" />
          {loading ? 'Actualizando...' : 'Guardar Cambios'}
        </IonButton>

        <IonLoading isOpen={loading} message="Actualizando producto..." />

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

export default EditProduct;
