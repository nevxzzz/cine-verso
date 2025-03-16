import React from 'react';

/**
 * Interface que define as propriedades do componente SocialButton
 * @interface SocialButtonProps
 * @property {React.ReactNode} icon - Ícone do provedor de autenticação social
 * @property {string} provider - Nome do provedor de autenticação (ex: Google, Facebook)
 * @property {() => void} onClick - Função de callback executada ao clicar no botão
 */
interface SocialButtonProps {
  icon: React.ReactNode;
  provider: string;
  onClick?: () => void;
}

/**
 * Componente que renderiza um botão de autenticação social
 * 
 * @component
 * @param {SocialButtonProps} props - Propriedades do componente
 * @returns {JSX.Element} Botão estilizado para autenticação social
 */
const SocialButton: React.FC<SocialButtonProps> = ({ icon, provider, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 bg-background-alt border border-gray-700 
                 text-white py-3 px-4 rounded-md hover:bg-opacity-80 transition-all duration-200"
    >
      {icon}
      <span>Continuar com {provider}</span>
    </button>
  );
};

export default SocialButton; 