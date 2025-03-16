/**
 * Componente MovieGrid
 * 
 * Este componente exibe uma grade de filmes ou séries,
 * organizando os cards em um layout responsivo.
 */
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaStar, FaImage } from 'react-icons/fa';
import { getImageUrl } from '@/lib/services/imdb';

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
 * Props do componente MovieGrid
 * @property movies - Array de objetos de filmes ou séries a serem exibidos
 */
interface MovieGridProps {
  movies: Movie[];
}

/**
 * Componente que exibe uma grade responsiva de filmes ou séries
 * @param movies - Array de filmes ou séries a serem exibidos
 */
const MovieGrid: React.FC<MovieGridProps> = ({ movies }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  /**
   * Determina o link correto para a página de detalhes com base no tipo de mídia
   * @param movie - Objeto do filme ou série
   * @returns URL para a página de detalhes
   */
  const getDetailLink = (movie: Movie) => {
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
   * @param movieId - ID do filme/série com erro de imagem
   */
  const handleImageError = (movieId: number) => {
    setImageErrors(prev => ({ ...prev, [movieId]: true }));
  };

  /**
   * Registra quando uma imagem foi carregada com sucesso
   * @param movieId - ID do filme/série com imagem carregada
   */
  const handleImageLoad = (movieId: number) => {
    setImagesLoaded(prev => ({ ...prev, [movieId]: true }));
  };

  // Filtra filmes sem poster_path ou com erros de imagem
  const validMovies = movies.filter(movie => movie.poster_path && !imageErrors[movie.id]);

  if (validMovies.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <div className="text-center">
          <FaImage className="text-gray-600 mx-auto mb-2" size={40} />
          <p className="text-gray-400">Nenhum título disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {validMovies.map((movie) => (
        <div key={movie.id} className="relative w-[180px]">
          <Link href={getDetailLink(movie)}>
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden movie-card-hover group">
              <Image
                src={getImageUrl(movie.poster_path)}
                alt={movie.title || movie.name || ''}
                fill
                className="object-cover"
                onError={() => handleImageError(movie.id)}
                onLoad={() => handleImageLoad(movie.id)}
              />
              
              {/* Overlay ao passar o mouse */}
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-center text-sm font-semibold mb-2 truncate w-full">
                  {movie.title || movie.name}
                </h3>
                <div className="flex items-center space-x-2 mb-3">
                  <FaStar className="text-accent" size={12} />
                  <span>{movie.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400">
                    {(movie.release_date || movie.first_air_date) 
                      ? `(${new Date(movie.release_date || movie.first_air_date || '').getFullYear()})` 
                      : ''}
                  </span>
                </div>
                <button className="btn-primary py-1 px-4 flex items-center text-sm">
                  <FaPlay className="mr-2" size={12} /> Assistir
                </button>
              </div>
            </div>
            
            <h3 className="mt-2 text-sm font-medium truncate">
              {movie.title || movie.name}
            </h3>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default MovieGrid; 