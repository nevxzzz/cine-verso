import React, { useEffect } from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

/**
 * Interface que define as propriedades do componente Toast
 * @interface ToastProps
 * @property {string} message - Mensagem a ser exibida no toast
 * @property {'success' | 'error' | 'warning'} type - Tipo do toast que define sua aparência
 * @property {() => void} onClose - Função de callback para fechar o toast
 * @property {number} [duration=3000] - Duração em milissegundos que o toast ficará visível (opcional)
 */
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

/**
 * Componente que renderiza uma notificação temporária (toast)
 * Fecha automaticamente após a duração especificada
 * 
 * @component
 * @param {ToastProps} props - Propriedades do componente
 * @returns {JSX.Element} Notificação estilizada baseada no tipo
 */
const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  // Efeito para fechar o toast automaticamente após a duração especificada
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Limpa o timer quando o componente é desmontado
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Define a cor de fundo baseada no tipo do toast
  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-600';
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-700';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`${getBackgroundColor()} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-xs`}>
        <p>{message}</p>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Fechar notificação"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Toast; 