/**
 * Componente Header
 * 
 * Este componente representa o cabeçalho da aplicação, que contém:
 * - Logo e navegação principal
 * - Barra de pesquisa
 * - Menu de usuário (login/registro/perfil)
 * - Menu móvel para dispositivos menores
 */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaBell, FaUser, FaBars, FaTimes, FaHome, FaFilm, FaTv, FaHeart, FaUserCircle, FaStar } from 'react-icons/fa';
import { useRouter } from 'next/router';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Componente de cabeçalho responsivo com navegação e funcionalidades de usuário
 */
const Header: React.FC = () => {
  // Estados para controlar comportamentos do cabeçalho
  const [isScrolled, setIsScrolled] = useState(false);          // Controla se a página foi rolada para mudar o estilo
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Controla se o menu móvel está aberto
  const [searchQuery, setSearchQuery] = useState('');           // Armazena o texto de pesquisa
  const [isResettingPassword, setIsResettingPassword] = useState(false); // Controla o estado de redefinição de senha
  const [imageError, setImageError] = useState(false);          // Controla erros de carregamento de imagem
  const router = useRouter();
  const { user, logout } = useAuth();

  /**
   * Detecta o scroll da página para mudar o estilo do cabeçalho
   * Adiciona um fundo escuro quando a página é rolada para baixo
   */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Controla o comportamento da rolagem quando o menu móvel está aberto
   * Impede a rolagem do corpo da página quando o menu está visível
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  /**
   * Fecha o menu móvel quando a rota muda
   * Garante que o menu não fique aberto ao navegar entre páginas
   */
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  // Resetar o erro da imagem quando o usuário mudar
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  /**
   * Processa o envio do formulário de pesquisa
   * Redireciona para a página de resultados com o termo pesquisado
   * @param e - Evento do formulário
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  /**
   * Realiza o logout do usuário
   * Desconecta o usuário e redireciona para a página inicial
   */
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handlePasswordReset = async () => {
    if (!user || !user.email) {
      alert('Não foi possível identificar seu email. Entre em contato com o suporte.');
      return;
    }
    
    setIsResettingPassword(true);
    setIsMobileMenuOpen(false);
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert('Email de redefinição de senha enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      alert('Erro ao enviar email de redefinição de senha. Tente novamente.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Renderiza os itens do menu com animação
  const renderMenuItems = () => {
    const menuItems = [
      { href: '/', label: 'Início', icon: <FaHome size={20} /> },
      { href: '/movies', label: 'Filmes', icon: <FaFilm size={20} /> },
      { href: '/series', label: 'Séries', icon: <FaTv size={20} /> },
      { href: '/quero-assistir', label: 'Quero Assistir', icon: <FaHeart size={20} /> },
      { href: '/favoritos', label: 'Favoritos', icon: <FaStar size={20} /> },
    ];

    return menuItems.map((item, index) => (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center space-x-4 text-lg font-medium transition-all duration-300 hover:text-primary ${
          router.pathname === item.href ? 'text-primary' : 'text-white'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ 
          animation: isMobileMenuOpen 
            ? `fadeInRight 0.5s forwards` 
            : `fadeOut 0.3s forwards`,
          animationDelay: isMobileMenuOpen 
            ? `${0.1 + index * 0.1}s` 
            : `${0.05 * (menuItems.length - index - 1)}s`,
          opacity: isMobileMenuOpen ? 0 : 1
        }}
      >
        <span className="w-8 h-8 flex items-center justify-center">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    ));
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background shadow-lg py-2' : 'bg-gradient-to-b from-black/80 to-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight relative">
              <span className="text-primary group-hover:text-opacity-90 transition-all duration-300">Cine</span>
              <span className="text-white group-hover:text-primary-dark group-hover:text-opacity-20 transition-all duration-300 ml-[1px]">Verso</span>
              <span className="sr-only">CineVerso - Sua plataforma de streaming</span>
            </h1>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`nav-link ${router.pathname === '/' ? 'text-primary' : ''}`}>Início</Link>
            <Link href="/movies" className={`nav-link ${router.pathname === '/movies' ? 'text-primary' : ''}`}>Filmes</Link>
            <Link href="/series" className={`nav-link ${router.pathname === '/series' ? 'text-primary' : ''}`}>Séries</Link>
            <Link href="/quero-assistir" className={`nav-link ${router.pathname === '/quero-assistir' ? 'text-primary' : ''}`}>Quero Assistir</Link>
            <Link href="/favoritos" className={`nav-link ${router.pathname === '/favoritos' ? 'text-primary' : ''}`}>Favoritos</Link>
          </nav>

          {/* Ações do Usuário */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="bg-background-light py-2 px-4 pr-10 rounded-full text-sm focus:outline-none focus:ring-0 w-40 transition-all focus:w-60"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FaSearch size={14} />
              </button>
            </form>
            
            {user ? (
              <UserMenu />
            ) : (
              <Link 
                href="/auth/login"
                className="px-4 py-2 rounded bg-primary hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Botão do Menu Mobile - Redesenhado */}
          <button 
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-white z-50 transition-all duration-300 mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <div className="w-7 h-7 relative flex items-center justify-center group">
              <span className={`absolute h-[2px] bg-white rounded-full transition-all duration-300 shadow-sm group-hover:bg-primary ${
                isMobileMenuOpen ? 'w-0 opacity-0' : 'w-6 opacity-100'
              }`} style={{ transform: 'translateY(-7px)' }}></span>
              <span className={`absolute h-[2px] bg-white rounded-full transition-all duration-300 shadow-sm group-hover:bg-primary ${
                isMobileMenuOpen ? 'rotate-45 w-7' : 'w-6'
              }`}></span>
              <span className={`absolute h-[2px] bg-white rounded-full transition-all duration-300 shadow-sm group-hover:bg-primary ${
                isMobileMenuOpen ? '-rotate-45 w-7' : 'w-6'
              }`}></span>
              <span className={`absolute h-[2px] bg-white rounded-full transition-all duration-300 shadow-sm group-hover:bg-primary ${
                isMobileMenuOpen ? 'w-0 opacity-0' : 'w-6 opacity-100'
              }`} style={{ transform: 'translateY(7px)' }}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Menu Mobile - Redesenhado */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-500 backdrop-blur-md bg-background/90 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transitionProperty: 'opacity, visibility',
          transitionDuration: '0.5s',
          visibility: isMobileMenuOpen ? 'visible' : 'hidden'
        }}
      >
        <div className="mobile-menu-content h-full flex flex-col pt-20 px-6 overflow-y-auto">
          <nav className="flex flex-col space-y-6 py-8">
            {renderMenuItems()}
          </nav>
          
          <div className="mt-auto mb-8" style={{ 
            animation: isMobileMenuOpen ? 'slideInUp 0.5s forwards' : 'fadeOut 0.3s forwards',
            animationDelay: isMobileMenuOpen ? '0.2s' : '0s',
            opacity: isMobileMenuOpen ? 0 : 1
          }}>
            <form onSubmit={handleSearch} className="relative mb-8">
              <div className="relative flex items-center">
                <FaSearch className="absolute left-4 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar filmes e séries..."
                  className="bg-background-light py-3 pl-12 pr-4 rounded-full text-base focus:outline-none focus:ring-1 focus:ring-primary w-full transition-all duration-300 focus:bg-background-alt"
                />
              </div>
            </form>
            
            {user ? (
              <div className="bg-background-alt/50 rounded-xl p-4 backdrop-blur-sm hover:bg-background-alt/70 transition-all duration-300">
                <Link 
                  href="/perfil" 
                  className="flex items-center space-x-4 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {user && user.photoURL && !imageError ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                      <Image 
                        src={user.photoURL} 
                        alt={user.displayName || 'Usuário'} 
                        width={48} 
                        height={48}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110" 
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-primary transition-all duration-300 group-hover:scale-110" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{user?.displayName || 'Usuário'}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <p className="truncate max-w-[150px]">{user?.email}</p>
                      <span>•</span>
                      <p>Ver perfil</p>
                    </div>
                  </div>
                </Link>
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
                  <button 
                    onClick={handlePasswordReset}
                    disabled={isResettingPassword}
                    className="w-full flex items-center text-sm text-gray-400 hover:text-white transition-colors py-2 px-1 rounded hover:bg-background-alt/30"
                  >
                    {isResettingPassword ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Alterar senha
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center text-sm text-gray-400 hover:text-white transition-colors py-2 px-1 rounded hover:bg-background-alt/30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair da conta
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className="btn-primary w-full py-3 flex items-center justify-center text-base rounded-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser className="mr-2" size={16} /> Entrar na sua conta
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 