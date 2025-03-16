/**
 * Serviço de API do TMDB (The Movie Database)
 * Este arquivo contém funções para interagir com a API do TMDB e obter dados de filmes e séries
 */
import axios from 'axios';
import { API_CONFIG, TMDB_IMAGE_BASE_URL, POSTER_SIZES, BACKDROP_SIZES } from '../config';

/**
 * Cria uma instância do Axios configurada para a API do TMDB
 * Inclui a URL base, chave de API, idioma padrão (português do Brasil) e timeout
 */
const imdbApi = axios.create({
  baseURL: API_CONFIG.IMDB_API_URL,
  params: {
    api_key: API_CONFIG.IMDB_API_KEY,
    language: 'pt-BR'
  },
  timeout: 10000
});

/**
 * Gera a URL completa para uma imagem de pôster
 * @param path - Caminho relativo da imagem no TMDB
 * @param size - Tamanho desejado da imagem (pequeno, médio, grande ou original)
 * @returns URL completa da imagem ou imagem placeholder se o caminho for nulo
 */
export const getImageUrl = (path: string | null, size: keyof typeof POSTER_SIZES = 'medium') => {
  if (!path) return '/images/placeholder-poster.png';
  return `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES[size]}${path}`;
};

/**
 * Gera a URL completa para uma imagem de fundo (backdrop)
 * @param path - Caminho relativo da imagem no TMDB
 * @param size - Tamanho desejado da imagem (pequeno, médio, grande ou original)
 * @returns URL completa da imagem ou imagem placeholder se o caminho for nulo
 */
export const getBackdropUrl = (path: string | null, size: keyof typeof BACKDROP_SIZES = 'large') => {
  if (!path) return '/images/placeholder-backdrop.png';
  return `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZES[size]}${path}`;
};

/**
 * Objeto com métodos para interagir com a API do TMDB
 */
export const imdbService = {
  /**
   * Método genérico para fazer requisições GET à API
   * @param endpoint - Endpoint da API a ser acessado
   * @param params - Parâmetros adicionais para a requisição
   * @returns Dados da resposta da API
   */
  get: async (endpoint: string, params = {}) => {
    const response = await imdbApi.get(endpoint, { params });
    return response.data;
  },

  /**
   * Obtém conteúdos em tendência (filmes, séries ou ambos)
   * @param mediaType - Tipo de mídia: 'all' (todos), 'movie' (filmes) ou 'tv' (séries)
   * @param timeWindow - Janela de tempo: 'day' (dia) ou 'week' (semana)
   * @returns Lista de conteúdos em tendência
   */
  getTrending: async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
    const response = await imdbApi.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data;
  },

  /**
   * Obtém conteúdos populares (filmes ou séries)
   * @param mediaType - Tipo de mídia: 'movie' (filmes) ou 'tv' (séries)
   * @returns Lista de conteúdos populares
   */
  getPopular: async (mediaType: 'movie' | 'tv' = 'movie') => {
    const response = await imdbApi.get(`/${mediaType}/popular`);
    return response.data;
  },

  /**
   * Obtém conteúdos mais bem avaliados (filmes ou séries)
   * @param mediaType - Tipo de mídia: 'movie' (filmes) ou 'tv' (séries)
   * @returns Lista de conteúdos mais bem avaliados
   */
  getTopRated: async (mediaType: 'movie' | 'tv' = 'movie') => {
    const response = await imdbApi.get(`/${mediaType}/top_rated`);
    return response.data;
  },

  /**
   * Obtém filmes que serão lançados em breve
   * @param mediaType - Tipo de mídia (sempre 'movie' para esta função)
   * @returns Lista de filmes a serem lançados
   */
  getUpcoming: async (mediaType: 'movie' = 'movie') => {
    const response = await imdbApi.get(`/${mediaType}/upcoming`);
    return response.data;
  },

  /**
   * Obtém filmes em exibição nos cinemas atualmente
   * @param mediaType - Tipo de mídia (sempre 'movie' para esta função)
   * @returns Lista de filmes em exibição
   */
  getNowPlaying: async (mediaType: 'movie' = 'movie') => {
    const response = await imdbApi.get(`/${mediaType}/now_playing`);
    return response.data;
  },

  /**
   * Obtém séries que estão sendo exibidas hoje
   * @param mediaType - Tipo de mídia (sempre 'tv' para esta função)
   * @returns Lista de séries exibidas hoje
   */
  getAiringToday: async (mediaType: 'tv' = 'tv') => {
    const response = await imdbApi.get(`/${mediaType}/airing_today`);
    return response.data;
  },

  /**
   * Obtém séries que estão atualmente no ar
   * @param mediaType - Tipo de mídia (sempre 'tv' para esta função)
   * @returns Lista de séries no ar
   */
  getOnTheAir: async (mediaType: 'tv' = 'tv') => {
    const response = await imdbApi.get(`/${mediaType}/on_the_air`);
    return response.data;
  },

  /**
   * Obtém detalhes completos de um filme ou série
   * @param mediaType - Tipo de mídia: 'movie' (filme) ou 'tv' (série)
   * @param id - ID do filme ou série no TMDB
   * @returns Detalhes completos incluindo vídeos, créditos e conteúdos similares
   */
  getDetails: async (mediaType: 'movie' | 'tv', id: number) => {
    const response = await imdbApi.get(`/${mediaType}/${id}`, {
      params: {
        append_to_response: 'videos,credits,similar'
      }
    });
    return response.data;
  },

  /**
   * Obtém detalhes de uma temporada específica de uma série
   * @param seriesId - ID da série no TMDB
   * @param seasonNumber - Número da temporada
   * @returns Detalhes da temporada incluindo episódios
   */
  getSeasonDetails: async (seriesId: number, seasonNumber: number) => {
    const response = await imdbApi.get(`/tv/${seriesId}/season/${seasonNumber}`);
    return response.data;
  },

  /**
   * Realiza uma busca por filmes, séries e pessoas
   * @param query - Termo de busca
   * @param page - Número da página de resultados
   * @returns Resultados da busca
   */
  search: async (query: string, page: number = 1) => {
    const response = await imdbApi.get('/search/multi', {
      params: {
        query,
        page
      }
    });
    return response.data;
  },

  /**
   * Obtém a lista de gêneros disponíveis
   * @param mediaType - Tipo de mídia: 'movie' (filmes) ou 'tv' (séries)
   * @returns Lista de gêneros
   */
  getGenres: async (mediaType: 'movie' | 'tv' = 'movie') => {
    const response = await imdbApi.get(`/genre/${mediaType}/list`);
    return response.data;
  }
}; 