/**
 * Componente PublicRoute
 * 
 * Este componente protege rotas públicas, como páginas de login e registro.
 * Redireciona usuários já autenticados para a página inicial.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

/**
 * Props do componente PublicRoute
 * @property children - Conteúdo a ser renderizado se o usuário não estiver autenticado
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica se o usuário não está autenticado antes de renderizar o conteúdo
 * @param children - Conteúdo a ser renderizado se o usuário não estiver autenticado
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  /**
   * Efeito que verifica o estado de autenticação e redireciona se necessário
   * Redireciona para a página inicial se o usuário já estiver autenticado
   */
  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // Se estiver carregando ou o usuário estiver autenticado, não renderiza nada
  if (loading || user) {
    return null;
  }

  // Se o usuário não estiver autenticado, renderiza o conteúdo público
  return <>{children}</>;
};

export default PublicRoute; 