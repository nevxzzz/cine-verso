/**
 * Componente ProtectedRoute
 * 
 * Este componente protege rotas que exigem autenticação.
 * Redireciona usuários não autenticados para a página de login.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

/**
 * Props do componente ProtectedRoute
 * @property children - Conteúdo a ser renderizado se o usuário estiver autenticado
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica se o usuário está autenticado antes de renderizar o conteúdo
 * @param children - Conteúdo a ser renderizado se o usuário estiver autenticado
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  /**
   * Efeito que verifica o estado de autenticação e redireciona se necessário
   * Redireciona para a página de login se o usuário não estiver autenticado
   */
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  // Se estiver carregando ou o usuário não estiver autenticado, exibe um indicador de carregamento
  if (loading || !user) {
    // Exibir um indicador de carregamento enquanto verifica a autenticação
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se o usuário estiver autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute; 