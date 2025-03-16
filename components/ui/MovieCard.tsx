import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaPlay, FaPlus, FaHeart, FaImage } from 'react-icons/fa';
import { useRouter } from 'next/router';

/**
 * Interface que define as propriedades do componente MovieCard
 * @interface MovieCardProps
 * @property {number} id - ID do filme ou série
 * @property {string} title - Título do filme ou série
 * @property {string} poster - Caminho para o poster da mídia
 * @property {string} year - Ano de lançamento
 * @property {number} rating - Nota média de avaliação
 * @property {'movie' | 'tv'} [mediaType='movie'] - Tipo de mídia (filme ou série)
 * @property {boolean} [isFavorite=false] - Indica se o item está nos favoritos
 * @property {(id: number) => void} [onAddToFavorites] - Função para adicionar aos favoritos
 * @property {(id: number) => void} [onAddToWatchlist] - Função para adicionar à lista de "quero assistir"
 */
interface MovieCardProps {
  id: number;
  title: string;
  poster: string;
  year: string;
  rating: number;
  mediaType?: 'movie' | 'tv';
  isFavorite?: boolean;
  onAddToFavorites?: (id: number) => void;
  onAddToWatchlist?: (id: number) => void;
}

/**
 * Componente que renderiza um card de filme ou série
 * Exibe poster, título, ano, avaliação e botões de ação
 * 
 * @component
 * @param {MovieCardProps} props - Propriedades do componente
 * @returns {JSX.Element} Card de filme ou série com interações
 */
const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  poster,
  year,
  rating,
  mediaType = 'movie',
  isFavorite = false,
  onAddToFavorites,
  onAddToWatchlist,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  /**
   * Determina o link correto para a página de detalhes com base no tipo de mídia
   * @returns {string} URL para a página de detalhes
   */
  const getDetailLink = () => {
    if (mediaType === 'tv') {
      return `/series/${id}`;
    } else {
      return `/movie/${id}`;
    }
  };

  // Se não houver caminho de poster ou se a imagem falhar ao carregar, exibir um placeholder
  if (!poster || imageError) {
    return (
      <div className="relative group">
        <Link href={getDetailLink()}>
          <div className="relative w-[180px] rounded-lg overflow-hidden movie-card-hover bg-background-light">
            <div className="relative aspect-[2/3] flex items-center justify-center">
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <FaImage className="text-gray-600 mb-2" size={40} />
                <h3 className="text-sm font-medium text-gray-400 truncate w-full">
                  {title || 'Sem imagem'}
                </h3>
              </div>
            </div>
          </div>
        </Link>
        
        <div className="mt-2 flex justify-between items-center">
          <h3 className="text-sm truncate">
            {title}
          </h3>
          
          <div className="flex space-x-1">
            {onAddToWatchlist && (
              <button 
                onClick={() => onAddToWatchlist(id)} 
                className="p-1 text-gray-300 hover:text-white"
                title="Adicionar à Lista"
              >
                <FaPlus size={14} />
              </button>
            )}
            
            {onAddToFavorites && (
              <button 
                onClick={() => onAddToFavorites(id)} 
                className={`p-1 ${isFavorite ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}
                title="Adicionar aos Favoritos"
              >
                <FaHeart size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={getDetailLink()}>
        <div className={`relative w-[180px] rounded-lg overflow-hidden movie-card-hover ${!imageLoaded ? 'bg-background-light' : ''}`}>
          <div className="relative aspect-[2/3]">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse w-full h-full bg-background-light"></div>
              </div>
            )}
            <Image
              src={poster}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          {/* Overlay ao passar o mouse */}
          {imageLoaded && (
            <div className={`absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-3 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <h3 className="text-center text-sm font-semibold mb-2 truncate w-full">{title}</h3>
              <div className="flex items-center space-x-2 mb-3">
                <FaStar className="text-accent" size={12} />
                <span>{rating.toFixed(1)}</span>
                <span className="text-gray-400">({year})</span>
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
      </Link>
      
      {/* Título visível apenas quando não está com hover */}
      <div className="mt-2 flex justify-between items-center">
        <h3 className={`text-sm truncate transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}>
          {title}
        </h3>
        
        {/* Botões de ação */}
        <div className={`flex space-x-1 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {onAddToWatchlist && (
            <button 
              onClick={() => onAddToWatchlist(id)} 
              className="p-1 text-gray-300 hover:text-white"
              title="Adicionar à Lista"
            >
              <FaPlus size={14} />
            </button>
          )}
          
          {onAddToFavorites && (
            <button 
              onClick={() => onAddToFavorites(id)} 
              className={`p-1 ${isFavorite ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}
              title="Adicionar aos Favoritos"
            >
              <FaHeart size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard; 