import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaUserCircle, FaKey, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Toast from '@/components/ui/Toast';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Interface que define a estrutura de uma mensagem de toast
 * @interface ToastMessage
 * @property {'success' | 'error'} type - Tipo da mensagem (sucesso ou erro)
 * @property {string} message - Texto da mensagem
 */
interface ToastMessage {
  type: 'success' | 'error';
  message: string;
}

/**
 * Componente que renderiza o menu do usuário no cabeçalho
 * Exibe foto de perfil, opções de conta e botão de logout
 * 
 * @component
 * @returns {JSX.Element} Menu do usuário com opções de conta
 */
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [imageError, setImageError] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  /**
   * Reseta o erro da imagem quando o usuário mudar
   */
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  /**
   * Realiza o logout do usuário e redireciona para a página inicial
   */
  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      router.push('/');
    }
  };

  /**
   * Envia um email de redefinição de senha para o usuário atual
   * Exibe um toast com o resultado da operação
   */
  const handleChangePassword = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setToast({
        type: 'success',
        message: 'Email de redefinição de senha enviado! Verifique sua caixa de entrada.'
      });
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      setToast({
        type: 'error',
        message: 'Erro ao enviar email de redefinição de senha. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity group"
        >
          {user.photoURL && !imageError ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-primary group-hover:border-opacity-80 transition-all">
              <Image 
                src={user.photoURL} 
                alt={user.displayName || 'Usuário'} 
                width={32} 
                height={32}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <FaUserCircle className="w-8 h-8 text-primary group-hover:text-opacity-80 transition-colors" />
          )}
          <div className="flex items-center">
            <span className="text-sm font-medium mr-1">{user.displayName || 'Usuário'}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-2 bg-background-alt/95 backdrop-blur-sm ring-1 ring-black ring-opacity-5 border border-gray-700/50 animate-fadeIn">
            <div className="px-3 py-2 border-b border-gray-700/50">
              <p className="text-sm font-medium text-white">{user.displayName || 'Usuário'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/perfil"
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-background-light hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FaUser className="mr-3 text-gray-400" />
                Meu Perfil
              </Link>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-background-light hover:text-white transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <FaKey className="mr-3 text-gray-400" />
                  Alterar senha
                </>
              )}
            </button>
            <div className="border-t border-gray-700/50 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-background-light hover:text-white transition-colors flex items-center"
              >
                <FaSignOutAlt className="mr-3 text-gray-400" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default UserMenu; 