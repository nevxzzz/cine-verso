/**
 * Hook de Listas do Usuário
 * 
 * Este hook personalizado gerencia as listas de favoritos e "quero assistir" do usuário,
 * sincronizando os dados com o Firestore quando o usuário está autenticado.
 */
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Interface que define a estrutura de um item de mídia (filme ou série)
 * @property id - ID do filme ou série
 * @property title - Título do filme (opcional)
 * @property name - Nome da série (opcional)
 * @property poster_path - Caminho da imagem do pôster
 * @property media_type - Tipo de mídia ('movie' ou 'tv')
 * @property added_at - Data em que o item foi adicionado à lista
 * @property vote_average - Nota média de avaliação (opcional)
 */
interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  added_at: string;
  vote_average?: number;
}

/**
 * Hook que gerencia as listas de favoritos e "quero assistir" do usuário
 * @returns Objeto com as listas, funções para alternar itens e verificar se um item está nas listas
 */
export const useUserLists = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Efeito que carrega as listas do usuário do Firestore quando o usuário muda
   * Se o usuário não estiver autenticado, as listas são esvaziadas
   */
  useEffect(() => {
    /**
     * Função que busca as listas do usuário no Firestore
     * Cria um documento para o usuário se ele não existir
     */
    const fetchLists = async () => {
      if (!user) {
        setFavorites([]);
        setWatchlist([]);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFavorites(data.favorites || []);
          setWatchlist(data.watchlist || []);
        } else {
          // Criar documento do usuário se não existir
          await setDoc(doc(db, 'users', user.uid), {
            favorites: [],
            watchlist: [],
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString()
          });
          setFavorites([]);
          setWatchlist([]);
        }
      } catch (error) {
        console.error('Erro ao buscar listas do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [user]);

  /**
   * Adiciona ou remove um item da lista de favoritos
   * @param item - Item a ser adicionado ou removido
   * @returns Promessa que resolve quando a operação é concluída
   */
  const toggleFavorite = async (item: MediaItem) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const isInList = favorites.some(
        fav => fav.id === item.id && fav.media_type === item.media_type
      );

      if (isInList) {
        // Remove o item se já estiver na lista
        await updateDoc(userRef, {
          favorites: arrayRemove(...favorites.filter(
            fav => fav.id === item.id && fav.media_type === item.media_type
          ))
        });
        setFavorites(prev => prev.filter(
          fav => !(fav.id === item.id && fav.media_type === item.media_type)
        ));
      } else {
        // Adiciona o item se não estiver na lista
        const newItem = {
          ...item,
          added_at: new Date().toISOString()
        };
        await updateDoc(userRef, {
          favorites: arrayUnion(newItem)
        });
        setFavorites(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    }
  };

  /**
   * Adiciona ou remove um item da lista de "quero assistir"
   * @param item - Item a ser adicionado ou removido
   * @returns Promessa que resolve quando a operação é concluída
   */
  const toggleWatchlist = async (item: MediaItem) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const isInList = watchlist.some(
        w => w.id === item.id && w.media_type === item.media_type
      );

      if (isInList) {
        // Remove o item se já estiver na lista
        await updateDoc(userRef, {
          watchlist: arrayRemove(...watchlist.filter(
            w => w.id === item.id && w.media_type === item.media_type
          ))
        });
        setWatchlist(prev => prev.filter(
          w => !(w.id === item.id && w.media_type === item.media_type)
        ));
      } else {
        // Adiciona o item se não estiver na lista
        const newItem = {
          ...item,
          added_at: new Date().toISOString()
        };
        await updateDoc(userRef, {
          watchlist: arrayUnion(newItem)
        });
        setWatchlist(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Erro ao atualizar lista de "quero assistir":', error);
    }
  };

  /**
   * Verifica se um item específico está na lista de favoritos
   * @param id - ID do filme ou série
   * @param mediaType - Tipo de mídia ('movie' ou 'tv')
   * @returns Verdadeiro se o item estiver na lista, falso caso contrário
   */
  const isInFavorites = (id: number, mediaType: 'movie' | 'tv') => {
    return favorites.some(item => item.id === id && item.media_type === mediaType);
  };

  /**
   * Verifica se um item específico está na lista de "quero assistir"
   * @param id - ID do filme ou série
   * @param mediaType - Tipo de mídia ('movie' ou 'tv')
   * @returns Verdadeiro se o item estiver na lista, falso caso contrário
   */
  const isInWatchlist = (id: number, mediaType: 'movie' | 'tv') => {
    return watchlist.some(item => item.id === id && item.media_type === mediaType);
  };

  return {
    favorites,
    watchlist,
    loading,
    toggleFavorite,
    toggleWatchlist,
    isInFavorites,
    isInWatchlist
  };
}; 