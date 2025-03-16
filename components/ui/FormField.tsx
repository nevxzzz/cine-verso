import React, { InputHTMLAttributes } from 'react';

/**
 * Interface que define as propriedades do componente FormField
 * @interface FormFieldProps
 * @extends {InputHTMLAttributes<HTMLInputElement>}
 * @property {string} label - Texto do rótulo do campo
 * @property {string} id - ID único do campo
 * @property {string} [error] - Mensagem de erro (opcional)
 * @property {React.ReactNode} [icon] - Ícone a ser exibido no campo (opcional)
 */
interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  icon?: React.ReactNode;
}

/**
 * Componente que renderiza um campo de formulário com rótulo, ícone opcional e mensagem de erro
 * 
 * @component
 * @param {FormFieldProps} props - Propriedades do componente
 * @returns {JSX.Element} Campo de formulário estilizado
 */
const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  id, 
  error, 
  icon, 
  type = 'text',
  ...props 
}) => {
  return (
    <div className="mb-4">
      {/* Rótulo do campo */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      
      {/* Container do campo de entrada com ícone opcional */}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        {/* Campo de entrada com estilização condicional baseada na presença de ícone e erro */}
        <input
          id={id}
          type={type}
          className={`
            w-full bg-background-alt border rounded-md py-3 px-4 text-white
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : 'border-gray-700'}
          `}
          {...props}
        />
      </div>
      
      {/* Mensagem de erro condicional */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField; 