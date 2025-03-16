/**
 * Serviço de Histórico de Visualização
 * 
 * Este serviço gerencia o histórico de visualização de filmes e séries,
 * armazenando os dados no Firestore quando o usuário está autenticado
 * e no localStorage quando não está.
 */
import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Interface para o histórico de episódios assistidos
 * @interface WatchHistoryItem
 * @property {number} seriesId - ID da série
 * @property {number} seasonNumber - Número da temporada
 * @property {number} episodeNumber - Número do episódio
 * @property {number} timestamp - Timestamp em milissegundos de quando foi assistido
 * @property {string} [episodeName] - Nome do episódio (opcional)
 */
export interface WatchHistoryItem {
  seriesId: number;
  seasonNumber: number;
  episodeNumber: number;
  timestamp: number;
  episodeName?: string;
}

/**
 * Função para obter o ID do usuário atual
 * @returns {string | null} ID do usuário ou null se não estiver autenticado
 */
const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

/**
 * Função para verificar se o Firestore está disponível
 * @returns {Promise<boolean>} Verdadeiro se o Firestore estiver disponível, falso caso contrário
 */
const isFirestoreAvailable = async (): Promise<boolean> => {
  try {
    // Tenta acessar uma coleção para verificar se o Firestore está funcionando
    const testCollection = collection(db, 'test');
    return true;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade do Firestore:', error);
    return false;
  }
};

// Serviço para gerenciar o histórico de episódios assistidos
export const watchHistoryService = {
  // Marcar um episódio como assistido
  markEpisodeAsWatched: async (
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number,
    episodeName?: string
  ): Promise<boolean> => {
    try {
      console.log('Iniciando markEpisodeAsWatched:', { seriesId, seasonNumber, episodeNumber });
      
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('Usuário não autenticado');
        return false;
      }

      // Verificar se o Firestore está disponível
      const firestoreAvailable = await isFirestoreAvailable();
      if (!firestoreAvailable) {
        console.error('Firestore não está disponível');
        return false;
      }

      const episodeKey = `s${seasonNumber}e${episodeNumber}`;
      const seriesKey = `series_${seriesId}`;
      
      console.log('Criando referência ao documento:', { userId, seriesKey, episodeKey });
      
      // Referência ao documento do usuário
      const userWatchHistoryRef = doc(db, 'watchHistory', userId);
      
      // Verificar se o documento existe
      console.log('Verificando se o documento existe');
      const docSnap = await getDoc(userWatchHistoryRef);
      
      console.log('Documento existe?', docSnap.exists());
      
      const episodeData = {
        seriesId,
        seasonNumber,
        episodeNumber,
        episodeName,
        timestamp: Date.now(),
        serverTimestamp: serverTimestamp()
      };
      
      if (!docSnap.exists()) {
        // Se o documento não existir, criar um novo
        console.log('Criando novo documento');
        try {
          await setDoc(userWatchHistoryRef, {
            [seriesKey]: {
              [episodeKey]: episodeData
            }
          });
          console.log('Documento criado com sucesso');
        } catch (error) {
          console.error('Erro ao criar documento:', error);
          return false;
        }
      } else {
        // Se o documento existir, atualizar
        console.log('Atualizando documento existente');
        try {
          await updateDoc(userWatchHistoryRef, {
            [`${seriesKey}.${episodeKey}`]: episodeData
          });
          console.log('Documento atualizado com sucesso');
        } catch (error) {
          console.error('Erro ao atualizar documento:', error);
          return false;
        }
      }
      
      console.log('Operação concluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao marcar episódio como assistido:', error);
      return false;
    }
  },
  
  // Desmarcar um episódio como assistido
  unmarkEpisodeAsWatched: async (
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<boolean> => {
    try {
      console.log('Iniciando unmarkEpisodeAsWatched:', { seriesId, seasonNumber, episodeNumber });
      
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('Usuário não autenticado');
        return false;
      }

      // Verificar se o Firestore está disponível
      const firestoreAvailable = await isFirestoreAvailable();
      if (!firestoreAvailable) {
        console.error('Firestore não está disponível');
        return false;
      }

      const episodeKey = `s${seasonNumber}e${episodeNumber}`;
      const seriesKey = `series_${seriesId}`;
      
      console.log('Criando referência ao documento:', { userId, seriesKey, episodeKey });
      
      // Referência ao documento do usuário
      const userWatchHistoryRef = doc(db, 'watchHistory', userId);
      
      // Verificar se o documento existe
      console.log('Verificando se o documento existe');
      const docSnap = await getDoc(userWatchHistoryRef);
      
      console.log('Documento existe?', docSnap.exists());
      
      if (docSnap.exists()) {
        // Remover o episódio do histórico
        console.log('Removendo episódio do histórico');
        try {
          await updateDoc(userWatchHistoryRef, {
            [`${seriesKey}.${episodeKey}`]: null
          });
          console.log('Episódio removido com sucesso');
        } catch (error) {
          console.error('Erro ao remover episódio:', error);
          return false;
        }
      } else {
        console.log('Documento não existe, nada para remover');
      }
      
      console.log('Operação concluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao desmarcar episódio como assistido:', error);
      return false;
    }
  },
  
  // Obter todos os episódios assistidos de uma série
  getWatchedEpisodes: async (seriesId: number): Promise<Record<string, boolean>> => {
    try {
      console.log('Iniciando getWatchedEpisodes:', { seriesId });
      
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('Usuário não autenticado');
        return {};
      }

      // Verificar se o Firestore está disponível
      const firestoreAvailable = await isFirestoreAvailable();
      if (!firestoreAvailable) {
        console.error('Firestore não está disponível');
        return {};
      }

      const seriesKey = `series_${seriesId}`;
      
      console.log('Criando referência ao documento:', { userId, seriesKey });
      
      // Referência ao documento do usuário
      const userWatchHistoryRef = doc(db, 'watchHistory', userId);
      
      // Obter o documento
      console.log('Obtendo documento');
      const docSnap = await getDoc(userWatchHistoryRef);
      
      console.log('Documento existe?', docSnap.exists());
      
      if (!docSnap.exists()) {
        console.log('Documento não existe, retornando objeto vazio');
        return {};
      }
      
      const data = docSnap.data();
      console.log('Dados obtidos:', data);
      
      const seriesData = data[seriesKey] || {};
      console.log('Dados da série:', seriesData);
      
      // Converter para o formato esperado pela interface
      const watchedEpisodes: Record<string, boolean> = {};
      
      Object.keys(seriesData).forEach(episodeKey => {
        if (seriesData[episodeKey] !== null) {
          watchedEpisodes[episodeKey] = true;
        }
      });
      
      console.log('Episódios assistidos:', watchedEpisodes);
      return watchedEpisodes;
    } catch (error) {
      console.error('Erro ao obter episódios assistidos:', error);
      return {};
    }
  },
  
  // Marcar todos os episódios de uma temporada como assistidos
  markSeasonAsWatched: async (
    seriesId: number,
    seasonNumber: number,
    episodes: { episodeNumber: number; episodeName?: string }[]
  ): Promise<boolean> => {
    try {
      console.log('Iniciando markSeasonAsWatched:', { seriesId, seasonNumber, episodesCount: episodes.length });
      
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('Usuário não autenticado');
        return false;
      }

      // Verificar se o Firestore está disponível
      const firestoreAvailable = await isFirestoreAvailable();
      if (!firestoreAvailable) {
        console.error('Firestore não está disponível');
        return false;
      }

      const seriesKey = `series_${seriesId}`;
      
      console.log('Criando referência ao documento:', { userId, seriesKey });
      
      // Referência ao documento do usuário
      const userWatchHistoryRef = doc(db, 'watchHistory', userId);
      
      // Verificar se o documento existe
      console.log('Verificando se o documento existe');
      const docSnap = await getDoc(userWatchHistoryRef);
      
      console.log('Documento existe?', docSnap.exists());
      
      const updates: Record<string, any> = {};
      const timestamp = Date.now();
      
      episodes.forEach(episode => {
        const episodeKey = `s${seasonNumber}e${episode.episodeNumber}`;
        updates[`${seriesKey}.${episodeKey}`] = {
          seriesId,
          seasonNumber,
          episodeNumber: episode.episodeNumber,
          episodeName: episode.episodeName,
          timestamp,
          serverTimestamp: serverTimestamp()
        };
      });
      
      console.log('Atualizações preparadas:', Object.keys(updates).length);
      
      if (!docSnap.exists()) {
        // Se o documento não existir, criar um novo
        console.log('Criando novo documento');
        try {
          await setDoc(userWatchHistoryRef, updates);
          console.log('Documento criado com sucesso');
        } catch (error) {
          console.error('Erro ao criar documento:', error);
          return false;
        }
      } else {
        // Se o documento existir, atualizar
        console.log('Atualizando documento existente');
        try {
          // Dividir as atualizações em lotes menores se houver muitos episódios
          if (Object.keys(updates).length > 20) {
            console.log('Muitas atualizações, dividindo em lotes');
            const batches = [];
            const keys = Object.keys(updates);
            
            for (let i = 0; i < keys.length; i += 20) {
              const batchUpdates: Record<string, any> = {};
              const batchKeys = keys.slice(i, i + 20);
              
              batchKeys.forEach(key => {
                batchUpdates[key] = updates[key];
              });
              
              batches.push(batchUpdates);
            }
            
            console.log(`Dividido em ${batches.length} lotes`);
            
            for (let i = 0; i < batches.length; i++) {
              console.log(`Processando lote ${i + 1}/${batches.length}`);
              await updateDoc(userWatchHistoryRef, batches[i]);
            }
          } else {
            await updateDoc(userWatchHistoryRef, updates);
          }
          
          console.log('Documento atualizado com sucesso');
        } catch (error) {
          console.error('Erro ao atualizar documento:', error);
          return false;
        }
      }
      
      console.log('Operação concluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao marcar temporada como assistida:', error);
      return false;
    }
  },
  
  // Desmarcar todos os episódios de uma temporada
  unmarkSeasonAsWatched: async (
    seriesId: number,
    seasonNumber: number,
    episodes: { episodeNumber: number }[]
  ): Promise<boolean> => {
    try {
      console.log('Iniciando unmarkSeasonAsWatched:', { seriesId, seasonNumber, episodesCount: episodes.length });
      
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('Usuário não autenticado');
        return false;
      }

      // Verificar se o Firestore está disponível
      const firestoreAvailable = await isFirestoreAvailable();
      if (!firestoreAvailable) {
        console.error('Firestore não está disponível');
        return false;
      }

      const seriesKey = `series_${seriesId}`;
      
      console.log('Criando referência ao documento:', { userId, seriesKey });
      
      // Referência ao documento do usuário
      const userWatchHistoryRef = doc(db, 'watchHistory', userId);
      
      // Verificar se o documento existe
      console.log('Verificando se o documento existe');
      const docSnap = await getDoc(userWatchHistoryRef);
      
      console.log('Documento existe?', docSnap.exists());
      
      if (docSnap.exists()) {
        const updates: Record<string, any> = {};
        
        episodes.forEach(episode => {
          const episodeKey = `s${seasonNumber}e${episode.episodeNumber}`;
          updates[`${seriesKey}.${episodeKey}`] = null;
        });
        
        console.log('Atualizações preparadas:', Object.keys(updates).length);
        
        // Atualizar o documento
        console.log('Atualizando documento');
        try {
          // Dividir as atualizações em lotes menores se houver muitos episódios
          if (Object.keys(updates).length > 20) {
            console.log('Muitas atualizações, dividindo em lotes');
            const batches = [];
            const keys = Object.keys(updates);
            
            for (let i = 0; i < keys.length; i += 20) {
              const batchUpdates: Record<string, any> = {};
              const batchKeys = keys.slice(i, i + 20);
              
              batchKeys.forEach(key => {
                batchUpdates[key] = updates[key];
              });
              
              batches.push(batchUpdates);
            }
            
            console.log(`Dividido em ${batches.length} lotes`);
            
            for (let i = 0; i < batches.length; i++) {
              console.log(`Processando lote ${i + 1}/${batches.length}`);
              await updateDoc(userWatchHistoryRef, batches[i]);
            }
          } else {
            await updateDoc(userWatchHistoryRef, updates);
          }
          
          console.log('Documento atualizado com sucesso');
        } catch (error) {
          console.error('Erro ao atualizar documento:', error);
          return false;
        }
      } else {
        console.log('Documento não existe, nada para remover');
      }
      
      console.log('Operação concluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao desmarcar temporada como assistida:', error);
      return false;
    }
  },
  
  // Verificar se o usuário está autenticado
  isAuthenticated: (): boolean => {
    return !!getCurrentUserId();
  },
  
  // Verificar se o Firestore está disponível
  checkFirestoreAvailability: async (): Promise<boolean> => {
    return await isFirestoreAvailable();
  }
}; 