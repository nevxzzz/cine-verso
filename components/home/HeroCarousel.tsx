import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import { FaPlay, FaStar, FaChevronLeft, FaChevronRight, FaImage, FaClock } from 'react-icons/fa';
import { getBackdropUrl, getImageUrl } from '@/lib/services/imdb';
import { useUserLists } from '@/hooks/useUserLists';
import { useAuth } from '@/hooks/useAuth';
import Toast from '@/components/ui/Toast';
import MoviePlayer from '@/components/ui/MoviePlayer';

// Importações necessárias para o Slick Carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Movie {
  id: number;
  title: string;
  name?: string;
  backdrop_path: string;
  poster_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
}

interface HeroCarouselProps {
  movies: Movie[];
}

// Mapeamento de IDs de gêneros para nomes
const genreMap: { [key: number]: string } = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Cinema TV',
  53: 'Thriller',
  10752: 'Guerra',
  37: 'Faroeste'
};

const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies }) => {
  const { user } = useAuth();
  const { toggleWatchlist, isInWatchlist } = useUserLists();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [transitionSpeed, setTransitionSpeed] = useState(1200);
  const [transitionType, setTransitionType] = useState<'normal' | 'manual' | 'loop'>('normal');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [processingMovies, setProcessingMovies] = useState<Record<number, boolean>>({});
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const sliderRef = React.useRef<Slider>(null);

  const nextSlide = () => {
    // Verificar se está no último slide
    if (currentSlide === validMovies.length - 1) {
      // Se estiver no último slide, aplicar transição mais lenta ao voltar para o início
      setTransitionSpeed(1800);
      setTransitionType('loop');
      sliderRef.current?.slickNext();
      setTimeout(() => {
        setTransitionSpeed(1200);
        setTransitionType('normal');
      }, 2000);
    } else {
      // Transição normal mais rápida para outros slides
      setTransitionSpeed(1000);
      setTransitionType('manual');
      sliderRef.current?.slickNext();
      setTimeout(() => {
        setTransitionSpeed(1200);
        setTransitionType('normal');
      }, 1500);
    }
  };

  const prevSlide = () => {
    // Verificar se está no primeiro slide
    if (currentSlide === 0) {
      // Se estiver no primeiro slide, aplicar transição mais lenta ao ir para o último
      setTransitionSpeed(1800);
      setTransitionType('loop');
      sliderRef.current?.slickPrev();
      setTimeout(() => {
        setTransitionSpeed(1200);
        setTransitionType('normal');
      }, 2000);
    } else {
      // Transição normal mais rápida para outros slides
      setTransitionSpeed(1000);
      setTransitionType('manual');
      sliderRef.current?.slickPrev();
      setTimeout(() => {
        setTransitionSpeed(1200);
        setTransitionType('normal');
      }, 1500);
    }
  };
  
  // Função para determinar o link correto com base no tipo de mídia
  const getDetailLink = (movie: Movie) => {
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

  // Função para lidar com erro de carregamento de imagem
  const handleImageError = (movieId: number) => {
    setImageErrors(prev => ({ ...prev, [movieId]: true }));
  };

  // Função para lidar com carregamento bem-sucedido de imagem
  const handleImageLoad = (movieId: number) => {
    setImagesLoaded(prev => ({ ...prev, [movieId]: true }));
  };
  
  // Filtra filmes sem backdrop_path ou com erros de imagem
  const validMovies = movies.filter(movie => movie.backdrop_path && !imageErrors[movie.id]);

  // Se não houver filmes válidos, exibir mensagem
  if (validMovies.length === 0) {
    return (
      <div className="relative h-[300px] bg-background-light flex items-center justify-center">
        <div className="text-center">
          <FaImage className="text-gray-600 mx-auto mb-2" size={40} />
          <p className="text-gray-400">Nenhum destaque disponível</p>
        </div>
      </div>
    );
  }
  
  // Configurações para o slider
  const settings = {
    dots: true,
    infinite: true,
    speed: transitionSpeed,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    cssEase: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    fade: false,
    swipeToSlide: true,
    touchThreshold: 10,
    useCSS: true,
    useTransform: true,
    swipe: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          dots: false,
          speed: Math.floor(transitionSpeed * 0.85), // 15% mais rápido em mobile
          touchThreshold: 5, // Mais sensível ao toque
          swipe: true,
          swipeToSlide: true,
        }
      }
    ],
    beforeChange: (_: any, next: number) => {
      setCurrentSlide(next);
      // Se estiver voltando do último slide para o primeiro, torne a transição mais lenta
      if (next === 0 && _ === validMovies.length - 1 && transitionType === 'normal') {
        setTransitionSpeed(1800); // Transição mais lenta para voltar ao início
        setTransitionType('loop');
        setTimeout(() => {
          setTransitionSpeed(1200);
          setTransitionType('normal');
        }, 2000); // Restaurar velocidade normal após a transição
      }
    },
    customPaging: (i: number) => (
      <div
        className={`mx-1 transition-all duration-300 rounded-full hidden md:block ${
          i === currentSlide 
            ? 'w-3 h-3 scale-105 animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary shadow-lg shadow-primary/30' 
            : 'w-3 h-3 bg-[#1f1f1f] hover:bg-[#750509]'
        }`}
      />
    ),
    appendDots: (dots: React.ReactNode) => (
      <div className="absolute bottom-6 left-0 right-0 hidden md:block">
        <ul className="flex justify-center items-center m-0 p-0"> {dots} </ul>
      </div>
    ),
  };

  // Autoplay
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleWatchlist = async (movie: Movie) => {
    if (!user) {
      setToast({
        type: 'warning',
        message: 'Você precisa estar logado para adicionar à sua lista! Faça login ou crie uma conta para continuar.'
      });
      return;
    }

    // Evitar múltiplos cliques
    if (processingMovies[movie.id]) return;
    
    setProcessingMovies(prev => ({ ...prev, [movie.id]: true }));

    // Verificar se o item já está na lista antes da operação
    const isAlreadyInWatchlist = isInWatchlist(movie.id, movie.media_type);

    // Usar o mesmo formato de dados que o MediaActions
    const mediaItem = {
      id: movie.id,
      media_type: movie.media_type,
      title: movie.title || '',
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      added_at: new Date().toISOString()
    };

    try {
      const success = await toggleWatchlist(mediaItem);

      if (success) {
        setToast({
          type: 'success',
          message: isAlreadyInWatchlist
            ? 'Removido da lista'
            : 'Adicionado à lista'
        });
      } else {
        setToast({
          type: 'error',
          message: 'Erro ao atualizar lista'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar watchlist:', error);
      setToast({
        type: 'error',
        message: 'Erro ao atualizar lista'
      });
    } finally {
      setProcessingMovies(prev => ({ ...prev, [movie.id]: false }));
    }
  };

  // Função para abrir o player
  const handleWatchMovie = (movie: Movie) => {
    // Redirecionar para a página de detalhes em vez de abrir o player
    const mediaType = movie.media_type === 'movie' ? 'movie' : 'series';
    window.location.href = `/${mediaType}/${movie.id}`;
  };

  return (
    <div className="relative group hero-carousel">
      <Slider 
        ref={sliderRef} 
        {...settings} 
        className={`hero-slider hide-slick-buttons no-slick-arrows ${
          transitionType === 'manual' 
            ? 'manual-transition' 
            : transitionType === 'loop' 
              ? 'loop-transition' 
              : ''
        }`}
      >
        {validMovies.map((movie) => (
          <div key={movie.id} className="relative h-[600px] md:h-[600px]">
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            
            {/* Gradiente entre slides */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background/90 md:from-background to-transparent z-20" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background/90 md:from-background to-transparent z-20" />
            
            {/* Extensão do background para mobile */}
            <div className="absolute -bottom-1 left-0 right-0 h-4 bg-background z-20 md:hidden" />
            
            {/* Imagem de fundo */}
            <div className="relative h-full">
              {!imagesLoaded[movie.id] && (
                <div className="absolute inset-0 bg-background animate-pulse"></div>
              )}
              <Image
                src={getBackdropUrl(movie.backdrop_path, 'large')}
                alt={movie.title || movie.name || ''}
                fill
                priority
                className={`object-cover transition-opacity duration-1000 ${
                  imagesLoaded[movie.id] ? 'opacity-100' : 'opacity-0'
                }`}
                onError={() => handleImageError(movie.id)}
                onLoad={() => handleImageLoad(movie.id)}
              />
            </div>
            
            {/* Conteúdo */}
            <div className="absolute inset-0 z-30 flex items-end md:items-center pb-8 md:pb-0">
              <div className="container mx-auto px-6">
                <div className="max-w-2xl transition-all duration-1000 ease-in-out">
                  <h1 className="text-3xl md:text-5xl font-bold mb-3 transition-all duration-700 ease-out font-heading">
                    {movie.title || movie.name}
                  </h1>
                  <div className="flex items-center space-x-4 mb-3 transition-all duration-700 ease-out delay-100 text-caption">
                    <span className="flex items-center">
                      <FaStar className="text-accent mr-1" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span>
                      {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                    </span>
                  </div>
                  
                  {/* Gêneros - Visível apenas em mobile */}
                  <div className="flex flex-wrap gap-2 mb-3 md:hidden">
                    {movie.genre_ids.slice(0, 3).map((genreId) => 
                      genreMap[genreId] ? (
                        <span
                          key={genreId}
                          className="px-2 py-1 text-xs rounded-full bg-background-light text-gray-300"
                        >
                          {genreMap[genreId]}
                        </span>
                      ) : null
                    )}
                  </div>

                  {/* Overview - Escondido em mobile */}
                  <p className="hidden md:block text-gray-300 text-lg mb-6 line-clamp-3 transition-all duration-700 ease-out delay-200 font-body">
                    {movie.overview}
                  </p>

                  <div className="flex space-x-4 transition-all duration-700 ease-out delay-300">
                    <button 
                      onClick={() => handleWatchMovie(movie)}
                      className="btn-primary flex items-center text-sm md:text-base"
                    >
                      <FaPlay className="mr-2" /> Assistir
                    </button>
                    
                    {/* Botão "Quero Assistir" para mobile e desktop */}
                    <button
                      onClick={() => handleToggleWatchlist(movie)}
                      className={`btn-secondary flex items-center text-sm md:text-base ${
                        isInWatchlist(movie.id, movie.media_type) ? 'bg-primary text-white' : ''
                      } ${processingMovies[movie.id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={processingMovies[movie.id]}
                    >
                      <FaClock className={`mr-2 ${processingMovies[movie.id] ? 'animate-pulse' : ''}`} />
                      {processingMovies[movie.id] 
                        ? 'Processando...' 
                        : isInWatchlist(movie.id, movie.media_type) 
                          ? 'Na Lista' 
                          : 'Quero Assistir'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Botões de navegação - Visíveis apenas em desktop */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:brightness-[0.6]"
        aria-label="Slide anterior"
      >
        <FaChevronLeft className="text-2xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:brightness-[0.6]"
        aria-label="Próximo slide"
      >
        <FaChevronRight className="text-2xl" />
      </button>

      {/* Toast de sucesso/erro */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Player do filme/série */}
      {showPlayer && selectedMovie && (
        <MoviePlayer
          movieId={selectedMovie.id}
          title={selectedMovie.title || selectedMovie.name || ''}
          mediaType={selectedMovie.media_type}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
};

export default HeroCarousel; 