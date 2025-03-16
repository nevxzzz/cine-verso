/**
 * Serviço de Streaming WarezCDN
 * 
 * Este serviço fornece funções para obter links de streaming e legendas
 * de filmes e séries através da API WarezCDN.
 */
import axios from 'axios';
import { API_CONFIG } from '../config';

/**
 * Cliente Axios configurado para a API WarezCDN
 * Inclui URL base e token de autenticação
 */
const warezApi = axios.create({
  baseURL: API_CONFIG.WAREZ_CDN_API_URL,
  headers: {
    'Authorization': `Bearer ${API_CONFIG.WAREZ_CDN_API_KEY}`
  }
});

/**
 * Objeto que contém métodos para interagir com a API WarezCDN
 */
export const warezService = {
  /**
   * Obtém links de streaming para um filme específico
   * @param {string} imdbId - ID do filme no IMDB
   * @returns {Promise<any>} Dados com os links de streaming disponíveis
   */
  getStreamingLinks: async (imdbId: string) => {
    const response = await warezApi.get(`/movies/${imdbId}/streams`);
    return response.data;
  },

  /**
   * Obtém links de streaming para um episódio específico de uma série
   * @param {string} imdbId - ID da série no IMDB
   * @param {number} season - Número da temporada
   * @param {number} episode - Número do episódio
   * @returns {Promise<any>} Dados com os links de streaming disponíveis
   */
  getEpisodeStreams: async (imdbId: string, season: number, episode: number) => {
    const response = await warezApi.get(`/series/${imdbId}/streams`, {
      params: {
        season,
        episode
      }
    });
    return response.data;
  },

  /**
   * Obtém legendas para um filme ou série
   * @param {string} imdbId - ID do filme ou série no IMDB
   * @param {string} [language='pt-BR'] - Código do idioma das legendas
   * @returns {Promise<any>} Dados com as legendas disponíveis
   */
  getSubtitles: async (imdbId: string, language: string = 'pt-BR') => {
    const response = await warezApi.get(`/subtitles/${imdbId}`, {
      params: {
        language
      }
    });
    return response.data;
  }
}; 