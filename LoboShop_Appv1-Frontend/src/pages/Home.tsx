import React from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
} from '@ionic/react';
import './Home.css';
import { 
  personCircleOutline, 
  logOutOutline, 
  storefrontOutline,
  addCircleOutline,
  listOutline 
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const history = useHistory();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>LoboShop - Inicio</IonTitle>
          <IonButton slot="end" onClick={handleLogout} fill="clear">
            <IonIcon icon={logOutOutline} />
            Salir
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>¡Bienvenido, {user?.nombre}!</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="ion-text-center ion-padding">
                    <IonIcon
                      icon={personCircleOutline}
                      className="profile-icon"
                    />
                    <h2>{user?.nombre}</h2>
                    <p>{user?.email}</p>
                    {user?.telefono && <p>📱 {user.telefono}</p>}
                    <p>
                      <strong>Rol:</strong> {user?.rol}
                    </p>
                  </div>

                  <IonButton
                    expand="block"
                    onClick={() => history.push('/profile')}
                  >
                    <IonIcon icon={personCircleOutline} slot="start" />
                    Ver Mi Perfil
                  </IonButton>
                </IonCardContent>
              </IonCard>

              {/* Nueva sección de acciones rápidas */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>🛒 Acciones Rápidas</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={() => history.push('/productos')}
                    className="ion-margin-bottom"
                  >
                    <IonIcon icon={storefrontOutline} slot="start" />
                    Ver Catálogo de Productos
                  </IonButton>

                  <IonButton
                    expand="block"
                    color="secondary"
                    onClick={() => history.push('/mis-productos')}
                    className="ion-margin-bottom"
                  >
                    <IonIcon icon={listOutline} slot="start" />
                    Mis Productos
                  </IonButton>

                  <IonButton
                    expand="block"
                    color="success"
                    onClick={() => history.push('/crear-producto')}
                  >
                    <IonIcon icon={addCircleOutline} slot="start" />
                    Vender un Producto
                  </IonButton>
                </IonCardContent>
              </IonCard>        
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;

