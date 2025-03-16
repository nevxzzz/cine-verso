import React, { useState, useEffect } from 'react';
import { FaTimes, FaExclamationTriangle, FaExpand } from 'react-icons/fa';

/**
 * Interface que define as propriedades do componente MoviePlayer
 * @interface MoviePlayerProps
 * @property {number} movieId - ID do filme ou série
 * @property {string} title - Título do filme ou série
 * @property {'movie' | 'tv'} mediaType - Tipo de mídia (filme ou série)
 * @property {number} [season] - Número da temporada (apenas para séries)
 * @property {number} [episode] - Número do episódio (apenas para séries)
 * @property {() => void} onClose - Função de callback para fechar o player
 */
interface MoviePlayerProps {
  movieId: number;
  title: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onClose: () => void;
}

/**
 * Componente que renderiza um player de vídeo para filmes e séries
 * Suporta modo tela cheia, tratamento de erros e carregamento
 * 
 * @component
 * @param {MoviePlayerProps} props - Propriedades do componente
 * @returns {JSX.Element} Player de vídeo com controles
 */
const MoviePlayer: React.FC<MoviePlayerProps> = ({ 
  movieId, 
  title, 
  mediaType, 
  season, 
  episode, 
  onClose 
}) => {
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Constrói a URL do player baseado no tipo de mídia e IDs
   * @returns {string} URL formatada para o iframe
   */
  const getPlayerUrl = () => {
    // Usar o método simples que está funcionando
    let url = `https://multiembed.mov/?video_id=${movieId}&tmdb=1`;
    
    // Adicionar parâmetros de temporada e episódio se for série
    if (mediaType === 'tv' && season && episode) {
      url += `&s=${season}&e=${episode}`;
    }
    
    return url;
  };

  /**
   * Manipula o evento de carregamento do iframe
   * Oculta o indicador de carregamento e mensagens de erro
   */
  const handleIframeLoad = () => {
    setLoading(false);
    setShowError(false);
  };

  /**
   * Manipula erros do iframe
   * Incrementa o contador de erros e mostra mensagem após 3 tentativas
   */
  const handleIframeError = () => {
    setErrorCount(prev => prev + 1);
    
    // Se ocorrer mais de 3 erros, mostrar mensagem de erro
    if (errorCount >= 3) {
      setShowError(true);
      setLoading(false);
    } else {
      setLoading(true);
      // Forçar recarregamento do iframe
      setIframeKey(prev => prev + 1);
    }
  };

  /**
   * Reinicia o player após um erro
   * Reseta contadores e força recarregamento
   */
  const retryPlayer = () => {
    setLoading(true);
    setIframeKey(prev => prev + 1);
    setErrorCount(0);
    setShowError(false);
  };

  /**
   * Alterna entre modo normal e tela cheia
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  /**
   * Efeito para adicionar tratamento de erro global
   * Captura erros relacionados ao iframe e player
   */
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      // Verificar se o erro é relacionado ao iframe ou FragLoaderError
      if (event.message.includes('FragLoaderError') || 
          event.message.includes('iframe') || 
          event.message.includes('load failed')) {
        event.preventDefault();
        handleIframeError();
      }
    };

    window.addEventListener('error', handleWindowError);
    return () => window.removeEventListener('error', handleWindowError);
  }, []);

  /**
   * Efeito para lidar com a tecla ESC
   * Sai do modo tela cheia ou fecha o player
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isFullscreen ? 'p-0' : 'p-4 md:p-8'
    }`}>
      {/* Botão X redesenhado com estilo minimalista */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 text-gray-400 hover:text-white transition-colors duration-300 group"
        aria-label="Fechar player"
      >
        <div className="relative w-8 h-8">
          <span className="absolute block w-8 h-0.5 bg-current transform rotate-45 group-hover:scale-110 transition-transform"></span>
          <span className="absolute block w-8 h-0.5 bg-current transform -rotate-45 group-hover:scale-110 transition-transform"></span>
        </div>
      </button>
      
      {/* Container principal do player com suporte a tela cheia */}
      <div className={`relative w-full max-w-5xl transition-all duration-300 ${
        isFullscreen ? 'max-w-none' : 'rounded-xl overflow-hidden shadow-2xl'
      }`}>
        {/* Barra superior com controles */}
        <div className={`absolute ${isFullscreen ? 'top-4 left-4 right-4' : '-top-12 left-0 right-0'} flex justify-between items-center text-white z-10 transition-all duration-300`}>
          {/* Título do filme/série */}
          <div className={`${isFullscreen ? 'bg-black bg-opacity-50 px-4 py-2 rounded-lg' : ''}`}>
            <h3 className="text-xl font-medium">{title}</h3>
            {mediaType === 'tv' && season && episode && (
              <p className="text-sm text-gray-300">Temporada {season}, Episódio {episode}</p>
            )}
          </div>
          
          {/* Controles */}
          <div className={`flex items-center gap-4 ${isFullscreen ? 'bg-black bg-opacity-50 px-4 py-2 rounded-lg' : ''}`}>
            {/* Botão de tela cheia */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-primary transition-colors"
              aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              <FaExpand size={20} />
            </button>
            
            {/* Botão de fechar na barra de controles (estilo atualizado) */}
            <button 
              onClick={onClose}
              className="text-white hover:text-primary transition-colors"
              aria-label="Fechar player"
            >
              <div className="relative w-6 h-6">
                <span className="absolute block w-6 h-0.5 bg-current transform rotate-45"></span>
                <span className="absolute block w-6 h-0.5 bg-current transform -rotate-45"></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Indicador de carregamento */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-alt bg-opacity-80 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
            <p className="text-white text-sm font-medium">Carregando player...</p>
          </div>
        )}
        
        {/* Mensagem de erro */}
        {showError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-alt bg-opacity-90 backdrop-blur-sm">
            <div className="bg-background-light p-8 rounded-xl max-w-md shadow-2xl border border-gray-700">
              <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
              <h3 className="text-white text-xl font-medium mb-2 text-center">Erro ao carregar o player</h3>
              <p className="text-gray-300 text-center mb-4">
                Não foi possível carregar o conteúdo. Isso pode ocorrer por vários motivos:
              </p>
              <ul className="text-gray-300 text-sm mb-6 list-disc pl-6">
                <li className="mb-1">O conteúdo não está disponível no momento</li>
                <li className="mb-1">Problemas de conexão com o servidor</li>
                <li className="mb-1">Bloqueio pelo navegador ou extensões</li>
              </ul>
              <button
                onClick={retryPlayer}
                className="w-full px-4 py-3 bg-primary rounded-full text-white hover:bg-opacity-80 transition-colors font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}
        
        {/* Player de vídeo (iframe) */}
        <div className={`aspect-video w-full bg-black ${isFullscreen ? '' : 'rounded-xl overflow-hidden shadow-lg'}`}>
          <iframe
            key={iframeKey}
            src={getPlayerUrl()}
            title={`Assistir ${title}`}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            referrerPolicy="no-referrer"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default MoviePlayer; 