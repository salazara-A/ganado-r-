import { useEffect } from 'react';

/**
 * Hook para interceptar el botón Atrás nativo del celular (gestos o botón físico)
 * Permite cerrar modales o volver a la pantalla anterior sin salir de la app
 */
export function useMobileBackHandler(
  isOpen: boolean,
  onClose: () => void,
  stateKey: string
) {
  useEffect(() => {
    if (!isOpen) return;

    // Insertar estado en el historial para capturar el botón Atrás
    const currentState = window.history.state || {};
    window.history.pushState({ ...currentState, [stateKey]: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose, stateKey]);
}
