/**
 * Configurações de API para o CineVerso
 * Este arquivo contém as chaves e URLs das APIs utilizadas no projeto
 */

/**
 * Configurações principais das APIs
 * @property IMDB_API_KEY - Chave de API para o The Movie Database (TMDB)
 * @property WAREZ_CDN_API_KEY - Chave de API para o Warez CDN (serviço de streaming)
 * @property IMDB_API_URL - URL base para a API do TMDB
 * @property WAREZ_CDN_API_URL - URL base para a API do Warez CDN
 */
export const API_CONFIG = {
  IMDB_API_KEY: process.env.IMDB_API_KEY || process.env.NEXT_PUBLIC_IMDB_API_KEY || '1f54bd990f1cdfb230adb312546d765d',
  WAREZ_CDN_API_KEY: process.env.WAREZ_CDN_API_KEY || '',
  IMDB_API_URL: 'https://api.themoviedb.org/3',
  WAREZ_CDN_API_URL: 'https://api.warezcdn.com/v1'
};

/**
 * URL base para as imagens do TMDB
 */
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Tamanhos disponíveis para os pôsteres de filmes/séries
 * Usado para otimizar o carregamento de imagens conforme necessário
 */
export const POSTER_SIZES = {
  small: 'w185',   // Tamanho pequeno - 185px de largura
  medium: 'w342',  // Tamanho médio - 342px de largura
  large: 'w500',   // Tamanho grande - 500px de largura
  original: 'original' // Tamanho original sem redimensionamento
};

/**
 * Tamanhos disponíveis para as imagens de fundo (backdrops)
 * Usado para otimizar o carregamento de imagens de fundo conforme necessário
 */
export const BACKDROP_SIZES = {
  small: 'w300',   // Tamanho pequeno - 300px de largura
  medium: 'w780',  // Tamanho médio - 780px de largura
  large: 'w1280',  // Tamanho grande - 1280px de largura
  original: 'original' // Tamanho original sem redimensionamento
}; 