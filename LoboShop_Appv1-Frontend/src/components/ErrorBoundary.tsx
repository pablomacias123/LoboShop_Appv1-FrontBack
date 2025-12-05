import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IonAlert, IonButton } from '@ionic/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar errores de React
 * y mostrar un mensaje amigable al usuario
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Error capturado:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Recargar la página para un reset completo
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
        }}>
          <h1 style={{ color: '#eb445a', marginBottom: '20px' }}>
            ⚠️ Error en la Aplicación
          </h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Ha ocurrido un error inesperado. Por favor, recarga la página.
          </p>
          {this.state.error && (
            <details style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              maxWidth: '600px',
              textAlign: 'left',
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Detalles del error
              </summary>
              <pre style={{
                fontSize: '12px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <IonButton onClick={this.handleReset} color="primary">
            Recargar Aplicación
          </IonButton>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

