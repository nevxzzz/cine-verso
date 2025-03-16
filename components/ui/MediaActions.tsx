import React from 'react';
import { FaHeart, FaClock } from 'react-icons/fa';
import { useUserLists } from '@/hooks/useUserLists';
import { useAuth } from '@/hooks/useAuth';
import Toast from './Toast';

/**
 * Interface que define as propriedades do componente MediaActions
 * @interface MediaActionsProps
 * @property {number} mediaId - ID do filme ou série
 * @property {'movie' | 'tv'} mediaType - Tipo de mídia (filme ou série)
 * @property {string} title - Título do filme ou série
 * @property {string} posterPath - Caminho para o poster da mídia
 * @property {number} vote_average - Nota média de avaliação
 */
interface MediaActionsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  vote_average: number;
}

/**
 * Componente que renderiza botões de ação para interagir com filmes e séries
 * Permite adicionar/remover da lista de favoritos e da lista de "quero assistir"
 * 
 * @component
 * @param {MediaActionsProps} props - Propriedades do componente
 * @returns {JSX.Element} Botões de ação e toast de feedback
 */
const MediaActions = ({ mediaId, mediaType, title, posterPath, vote_average }: MediaActionsProps) => {
  const { user } = useAuth();
  const { isInFavorites, isInWatchlist, toggleFavorite, toggleWatchlist } = useUserLists();
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  /**
   * Função que adiciona ou remove um item da lista de favoritos
   * Exibe um toast de feedback após a operação
   */
  const handleToggleFavorite = async () => {
    if (!user) {
      setToast({
        type: 'error',
        message: 'Faça login para adicionar aos favoritos'
      });
      return;
    }

    try {
      await toggleFavorite({
        id: mediaId,
        media_type: mediaType,
        title: title,
        poster_path: posterPath,
        vote_average: vote_average,
        added_at: new Date().toISOString()
      });
      
      setToast({
        type: 'success',
        message: isInFavorites(mediaId, mediaType) 
          ? 'Removido dos favoritos'
          : 'Adicionado aos favoritos'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Erro ao atualizar favoritos'
      });
    }
  };

  /**
   * Função que adiciona ou remove um item da lista de "quero assistir"
   * Exibe um toast de feedback após a operação
   */
  const handleToggleWatchlist = async () => {
    if (!user) {
      setToast({
        type: 'error',
        message: 'Faça login para adicionar à lista'
      });
      return;
    }

    try {
      await toggleWatchlist({
        id: mediaId,
        media_type: mediaType,
        title: title,
        poster_path: posterPath,
        vote_average: vote_average,
        added_at: new Date().toISOString()
      });
      
      setToast({
        type: 'success',
        message: isInWatchlist(mediaId, mediaType)
          ? 'Removido da lista'
          : 'Adicionado à lista'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Erro ao atualizar lista'
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Botão de favoritos que muda de aparência baseado no estado atual */}
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isInFavorites(mediaId, mediaType)
              ? 'bg-primary text-white'
              : 'bg-background-light text-gray-300 hover:bg-background'
          }`}
        >
          <FaHeart className={isInFavorites(mediaId, mediaType) ? 'text-white' : 'text-primary'} />
          <span>{isInFavorites(mediaId, mediaType) ? 'Favoritado' : 'Favoritar'}</span>
        </button>

        {/* Botão de "quero assistir" que muda de aparência baseado no estado atual */}
        <button
          onClick={handleToggleWatchlist}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isInWatchlist(mediaId, mediaType)
              ? 'bg-primary text-white'
              : 'bg-background-light text-gray-300 hover:bg-background'
          }`}
        >
          <FaClock className={isInWatchlist(mediaId, mediaType) ? 'text-white' : 'text-primary'} />
          <span>{isInWatchlist(mediaId, mediaType) ? 'Na Lista' : 'Quero Assistir'}</span>
        </button>
      </div>

      {/* Componente Toast para exibir mensagens de feedback */}
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

export default MediaActions; 