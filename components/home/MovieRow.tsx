/**
 * Componente MovieRow
 * 
 * Exibe uma linha horizontal de filmes ou séries com funcionalidade de carrossel
 * Permite navegar entre os itens usando botões de seta e visualizar detalhes ao passar o mouse
 */
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaStar, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';
import { getImageUrl } from '@/lib/services/imdb';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

/**
 * Interface que define a estrutura de um filme ou série
 */
interface Movie {
  id: number;
  title: string;
  name?: string;           // Nome usado para séries
  poster_path: string;     // Caminho da imagem do pôster
  release_date?: string;   // Data de lançamento para filmes
  first_air_date?: string; // Data de estreia para séries
  vote_average: number;    // Nota média de avaliação
  media_type?: 'movie' | 'tv'; // Tipo de mídia (filme ou série)
}

/**
 * Props do componente MovieRow
 */
interface MovieRowProps {
  title: string;       // Título da seção
  subtitle?: string;   // Subtítulo opcional
  movies: Movie[];     // Lista de filmes/séries a serem exibidos
  viewAllLink: string; // Link para ver todos os itens da categoria
}

/**
 * Componente que exibe uma linha horizontal de filmes/séries com navegação
 */
const MovieRow: React.FC<MovieRowProps> = ({ title, subtitle, movies, viewAllLink }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // Controla qual item está com mouse em cima
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({}); // Controla erros de carregamento de imagens
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({}); // Controla quais imagens foram carregadas
  const [isMobile, setIsMobile] = useState(false); // Detecta se o dispositivo é móvel
  const rowRef = useRef<HTMLDivElement>(null); // Referência para o elemento do carrossel

  /**
   * Efeito para detectar se o dispositivo é móvel
   * Atualiza o estado quando a janela é redimensionada
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Função para rolar o carrossel para a esquerda ou direita
   * @param direction - Direção da rolagem ('left' ou 'right')
   */
  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const container = rowRef.current;
      const cardWidth = isMobile ? container.clientWidth * 0.15 : 180; // 15vw em mobile, 180px em desktop
      const gap = 12; // gap-3 = 12px
      const scrollAmount = Math.floor((cardWidth + gap) * (isMobile ? 4.5 : 4.5)); // Rola 4.5 cards em mobile e desktop
      
      const newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

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

  return (
    <section className="mb-12">
      <div className="container mx-auto">
        {/* Cabeçalho da seção com título e link "Ver Todos" */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading">{title}</h2>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <Link href={viewAllLink} className="text-primary hover:text-primary-dark transition-colors font-body whitespace-nowrap">
            Ver Todos
          </Link>
        </div>

        {/* Container do carrossel com botões de navegação */}
        <div className="relative group px-8">
          {/* Botões de navegação - só mostrar se houver filmes válidos e não estiver em mobile */}
          {validMovies.length > 0 && !isMobile && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all ease-in-out duration-200 hover:bg-opacity-90 shadow-lg"
                aria-label="Rolar para a esquerda"
              >
                <FaChevronLeft className="text-xl" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all ease-in-out duration-200 hover:bg-opacity-90 shadow-lg"
                aria-label="Rolar para a direita"
              >
                <FaChevronRight className="text-xl" />
              </button>
            </>
          )}
          
          {/* Container dos cards de filmes/séries com rolagem horizontal */}
          <div 
            ref={rowRef}
            className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 scroll-smooth movie-row-container snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {validMovies.map((movie, index) => (
              <div 
                key={movie.id}
                className="flex-none w-[15vw] min-w-[100px] max-w-[120px] snap-start"
              >
                {/* Card do filme/série com efeito de hover */}
                <div 
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Link href={getDetailLink(movie)}>
                    {/* Container da imagem do pôster com estado de carregamento */}
                    <div className={`relative aspect-[2/3] rounded-lg overflow-hidden movie-card-hover ${!imagesLoaded[movie.id] ? 'bg-background-light' : ''}`}>
                      {/* Placeholder de carregamento animado */}
                      {!imagesLoaded[movie.id] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-pulse w-full h-full bg-background-light"></div>
                        </div>
                      )}
                      {/* Imagem do pôster com tratamento de erro e carregamento */}
                      <Image
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title || movie.name || ''}
                        fill
                        className={`object-cover transition-opacity duration-300 ${imagesLoaded[movie.id] ? 'opacity-100' : 'opacity-0'}`}
                        onError={() => handleImageError(movie.id)}
                        onLoad={() => handleImageLoad(movie.id)}
                      />
                      
                      {/* Overlay com informações e botão de assistir ao passar o mouse */}
                      {imagesLoaded[movie.id] && (
                        <div className={`absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-2 transition-opacity duration-300 ${
                          hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                        }`}>
                          {/* Título do filme/série no overlay */}
                          <h3 className="text-center text-xs font-semibold mb-1 truncate w-full">
                            {movie.title || movie.name}
                          </h3>
                          {/* Informações de avaliação e ano de lançamento */}
                          <div className="flex items-center space-x-1 mb-2">
                            <FaStar className="text-accent" size={10} />
                            <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
                            <span className="text-gray-400 text-xs">
                              {(movie.release_date || movie.first_air_date) 
                                ? `(${new Date(movie.release_date || movie.first_air_date || '').getFullYear()})` 
                                : ''}
                            </span>
                          </div>
                          {/* Botão de assistir */}
                          <button 
                            className="btn-primary py-1 px-3 flex items-center text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(getDetailLink(movie));
                            }}
                          >
                            <FaPlay className="mr-1" size={10} /> Assistir
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Título visível apenas quando não está com hover */}
                    <h3 className={`mt-2 text-sm truncate transition-opacity duration-300 ${
                      hoveredIndex === index ? 'opacity-0' : 'opacity-100'
                    }`}>
                      {movie.title || movie.name}
                    </h3>
                  </Link>
                </div>
              </div>
            ))}
            
            {/* Mensagem se não houver filmes válidos */}
            {validMovies.length === 0 && (
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-center">
                  <FaImage className="text-gray-600 mx-auto mb-2" size={40} />
                  <p className="text-gray-400">Nenhum título disponível</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieRow; 