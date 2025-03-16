/**
 * Hook de Lista de "Quero Assistir"
 * 
 * Este hook personalizado gerencia a lista de filmes e séries que o usuário
 * deseja assistir no futuro, armazenando-os no localStorage do navegador.
 */
import { useState, useEffect } from 'react';

/**
 * Interface que define a estrutura de um item na lista de "Quero Assistir"
 * @property id - ID do filme ou série
 * @property title - Título do filme (opcional)
 * @property name - Nome da série (opcional)
 * @property poster_path - Caminho da imagem do pôster
 * @property backdrop_path - Caminho da imagem de fundo
 * @property overview - Sinopse do conteúdo
 * @property release_date - Data de lançamento do filme (opcional)
 * @property first_air_date - Data de estreia da série (opcional)
 * @property vote_average - Nota média de avaliação
 * @property media_type - Tipo de mídia ('movie' ou 'tv')
 * @property added_at - Data em que o item foi adicionado à lista
 */
interface WatchlistItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  added_at: string;
}

/**
 * Hook que gerencia a lista de "Quero Assistir" do usuário
 * @returns Objeto com a lista, função para alternar itens e função para verificar se um item está na lista
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  /**
   * Carrega a lista salva do localStorage quando o componente é montado
   */
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  /**
   * Adiciona ou remove um item da lista de "Quero Assistir"
   * @param item - Item a ser adicionado ou removido
   */
  const toggleWatchlist = (item: WatchlistItem) => {
    setWatchlist(prevWatchlist => {
      // Verifica se o item já está na lista
      const isInList = prevWatchlist.some(
        watchlistItem => watchlistItem.id === item.id && watchlistItem.media_type === item.media_type
      );

      let newWatchlist;
      if (isInList) {
        // Remove o item se já estiver na lista
        newWatchlist = prevWatchlist.filter(
          watchlistItem => !(watchlistItem.id === item.id && watchlistItem.media_type === item.media_type)
        );
      } else {
        // Adiciona o item se não estiver na lista
        newWatchlist = [...prevWatchlist, item];
      }

      // Salva a lista atualizada no localStorage
      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  /**
   * Verifica se um item específico está na lista de "Quero Assistir"
   * @param id - ID do filme ou série
   * @param mediaType - Tipo de mídia ('movie' ou 'tv')
   * @returns Verdadeiro se o item estiver na lista, falso caso contrário
   */
  const isInWatchlist = (id: number, mediaType: 'movie' | 'tv') => {
    return watchlist.some(item => item.id === id && item.media_type === mediaType);
  };

  return {
    watchlist,
    toggleWatchlist,
    isInWatchlist
  };
} 