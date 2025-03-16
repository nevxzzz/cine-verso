/**
 * Componente MovieCard
 * 
 * Este componente exibe um card individual de filme ou série,
 * com imagem de pôster, título, avaliação e efeitos de hover.
 */
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaStar, FaImage } from 'react-icons/fa';
import { getImageUrl } from '@/lib/services/imdb';
import { useRouter } from 'next/router';

/**
 * Interface que define a estrutura de um filme ou série
 * @property id - ID único do filme/série
 * @property title - Título do filme
 * @property name - Nome da série (opcional)
 * @property poster_path - Caminho da imagem do pôster
 * @property release_date - Data de lançamento do filme (opcional)
 * @property first_air_date - Data de estreia da série (opcional)
 * @property vote_average - Nota média de avaliação
 * @property media_type - Tipo de mídia ('movie' ou 'tv')
 */
interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

/**
 * Props do componente MovieCard
 * @property movie - Objeto com dados do filme ou série
 * @property showHover - Define se o efeito de hover será exibido
 */
interface MovieCardProps {
  movie: Movie;
  showHover?: boolean;
}

/**
 * Componente que exibe um card de filme ou série com efeitos interativos
 * @param movie - Objeto com dados do filme ou série
 * @param showHover - Define se o efeito de hover será exibido (padrão: true)
 */
const MovieCard: React.FC<MovieCardProps> = ({ movie, showHover = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  /**
   * Determina o link correto para a página de detalhes com base no tipo de mídia
   * @returns URL para a página de detalhes do filme ou série
   */
  const getDetailLink = () => {
    // Se o item tem um título, é provavelmente um filme
    // Se o item tem um nome, é provavelmente uma série
    // Se o media_type está definido, usamos ele como fonte definitiva
    if (movie.media_type === 'tv') {
      return `/series/${movie.id}`;
    } else if (movie.media_type === 'movie') {
      return `/movie/${movie.id}`;
    } else if (movie.name && !movie.title) {
      return `/series/${movie.id}`;
    } else {
      return `/movie/${movie.id}`;
    }
  };

  /**
   * Trata erros de carregamento de imagens
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * Registra quando uma imagem foi carregada com sucesso
   */
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Se não houver caminho de poster ou se a imagem falhar ao carregar, exibir um placeholder
  if (!movie.poster_path || imageError) {
    return (
      <Link href={getDetailLink()}>
        <div className="relative w-[180px] rounded-lg overflow-hidden movie-card-hover bg-background-light">
          <div className="relative aspect-[2/3] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <FaImage className="text-gray-600 mb-2" size={40} />
              <h3 className="text-sm font-medium text-gray-400 truncate w-full">
                {movie.title || movie.name || 'Sem imagem'}
              </h3>
            </div>
          </div>
          
          <h3 className="mt-2 text-sm font-medium truncate p-2">
            {movie.title || movie.name}
          </h3>
          <div className="flex items-center text-xs text-gray-400 px-2 pb-2">
            <span className="flex items-center">
              <FaStar className="text-accent mr-1" size={10} />
              {movie.vote_average?.toFixed(1)}
            </span>
            <span className="mx-2">•</span>
            <span>
              {movie.release_date || movie.first_air_date 
                ? new Date(movie.release_date || movie.first_air_date || '').getFullYear() 
                : 'N/A'}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={getDetailLink()}>
      <div className={`relative w-[180px] rounded-lg overflow-hidden movie-card-hover ${!imageLoaded ? 'bg-background-light' : ''}`}>
        <div className="relative aspect-[2/3]">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-background-light"></div>
            </div>
          )}
          <Image
            src={getImageUrl(movie.poster_path)}
            alt={movie.title || movie.name || ''}
            fill
            className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
        
        {showHover && imageLoaded && (
          <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center p-3 transition-opacity duration-300">
            <h3 className="text-center text-sm font-semibold mb-2 truncate w-full">
              {movie.title || movie.name}
            </h3>
            <div className="flex items-center space-x-2 mb-3">
              <FaStar className="text-accent" size={12} />
              <span>{movie.vote_average?.toFixed(1)}</span>
              <span className="text-gray-400">
                ({new Date(movie.release_date || movie.first_air_date || '').getFullYear()})
              </span>
            </div>
            <button className="btn-primary py-1 px-4 flex items-center text-sm" 
              onClick={(e) => {
                e.preventDefault();
                router.push(getDetailLink());
              }}
            >
              <FaPlay className="mr-2" size={12} /> Assistir
            </button>
          </div>
        )}
      </div>
      
      <h3 className="mt-2 text-sm font-medium truncate">
        {movie.title || movie.name}
      </h3>
      <div className="flex items-center text-xs text-gray-400">
        <span className="flex items-center">
          <FaStar className="text-accent mr-1" size={10} />
          {movie.vote_average?.toFixed(1)}
        </span>
        <span className="mx-2">•</span>
        <span>
          {movie.release_date || movie.first_air_date 
            ? new Date(movie.release_date || movie.first_air_date || '').getFullYear() 
            : 'N/A'}
        </span>
      </div>
    </Link>
  );
};

export default MovieCard; 