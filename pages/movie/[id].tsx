import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import { imdbService, getImageUrl, getBackdropUrl } from '@/lib/services/imdb';
import { FaStar, FaCalendarAlt, FaClock, FaGlobe, FaPlayCircle, FaPlay, FaFilm, FaTimes } from 'react-icons/fa';
import MovieRow from '@/components/home/MovieRow';
import MediaActions from '@/components/ui/MediaActions';
import MoviePlayer from '@/components/ui/MoviePlayer';

interface MovieDetailsProps {
  movie: {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    runtime: number;
    vote_average: number;
    genres: Array<{ id: number; name: string }>;
    production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
    videos: {
      results: Array<{
        id: string;
        key: string;
        name: string;
        site: string;
        type: string;
      }>;
    };
    credits: {
      cast: Array<{
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
      }>;
    };
    similar: {
      results: Array<{
        id: number;
        title: string;
        poster_path: string;
        vote_average: number;
        release_date: string;
      }>;
    };
  };
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const movieId = params?.id;
    const [movieDetails, credits, similar] = await Promise.all([
      imdbService.get(`/movie/${movieId}`, {
        append_to_response: 'videos'
      }),
      imdbService.get(`/movie/${movieId}/credits`, {}),
      imdbService.get(`/movie/${movieId}/similar`, {})
    ]);

    return {
      props: {
        movie: {
          ...movieDetails,
          credits,
          similar
        }
      }
    };
  } catch (error) {
    console.error('Erro ao carregar dados do filme:', error);
    return {
      notFound: true
    };
  }
};

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');
  const [showNoTrailerMessage, setShowNoTrailerMessage] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Função para formatar a duração do filme
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Função para abrir o trailer
  const openTrailer = () => {
    // Procurar por um trailer oficial
    const trailer = movie.videos?.results.find(
      video => video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser') &&
      video.name.toLowerCase().includes('trailer')
    );
    
    // Se não encontrar um trailer oficial, pegar o primeiro trailer ou teaser
    const fallbackTrailer = movie.videos?.results.find(
      video => video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    );
    
    if (trailer || fallbackTrailer) {
      setTrailerKey((trailer || fallbackTrailer)?.key || '');
      setShowTrailer(true);
    } else {
      // Em vez de usar alert, mostrar o card personalizado
      setShowNoTrailerMessage(true);
      
      // Esconder a mensagem após 5 segundos
      setTimeout(() => {
        setShowNoTrailerMessage(false);
      }, 5000);
    }
  };
  
  // Função para fechar o trailer
  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey('');
  };
  
  // Função para fechar a mensagem de "sem trailer"
  const closeNoTrailerMessage = () => {
    setShowNoTrailerMessage(false);
  };

  return (
    <Layout>
      <Head>
        <title>{movie.title} | CineVerse</title>
        <meta name="description" content={movie.overview} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section com Backdrop - Ajustado para começar no topo da página */}
      <div className="relative min-h-[90vh] pt-16">
        {/* Imagem de fundo */}
        <div className="absolute inset-0 top-0 z-0">
          {movie.backdrop_path ? (
            <>
              <Image
                src={getBackdropUrl(movie.backdrop_path)}
                alt={movie.title}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Quando a imagem falhar, remover a src para não mostrar o ícone de imagem quebrada
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Gradiente para melhorar a legibilidade do conteúdo */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </>
          ) : (
            // Fundo sólido quando não houver imagem de backdrop
            <div className="absolute inset-0 bg-background" />
          )}
        </div>

        {/* Conteúdo - Ajustado para garantir que esteja sobre o gradiente e visível */}
        <div className="container mx-auto px-6 relative z-10 h-full flex items-end pt-32 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                width={256}
                height={384}
                className="w-full h-auto"
              />
            </div>

            {/* Informações do Filme - Ajustado para lidar com descrições longas */}
            <div className="flex-1 z-10">
              <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-400" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map(genre => (
                  <Link
                    key={genre.id}
                    href={`/categorias?genre=${genre.id}`}
                    className="px-3 py-1 bg-background-light rounded-full text-sm hover:bg-primary hover:text-white transition-colors duration-200"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Descrição com altura máxima e scroll quando necessário */}
              <div className="mb-8 max-w-3xl">
                {movie.overview ? (
                  <p className="text-gray-300">
                    {movie.overview}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    Ops! Parece que ainda não temos uma descrição para este filme. Estamos trabalhando para adicioná-la em breve!
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowPlayer(true)}
                  className="bg-primary hover:bg-opacity-60 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
                >
                  <FaPlayCircle />
                  Assistir Agora
                </button>
                
                <button 
                  onClick={openTrailer}
                  className="bg-background-alt hover:bg-opacity-60 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
                >
                  <FaFilm />
                  Ver Trailer
                </button>
              </div>

              <div className="mt-6">
                <MediaActions
                  mediaId={movie.id}
                  mediaType="movie"
                  title={movie.title}
                  posterPath={movie.poster_path}
                  vote_average={movie.vote_average}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Trailer */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={closeTrailer}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title={`${movie.title} - Trailer`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Card de aviso "Sem Trailer" */}
      {showNoTrailerMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-slideUp">
          <div className="bg-background-alt border border-gray-700 rounded-lg shadow-xl p-4 max-w-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <FaFilm className="text-primary mr-2" size={20} />
                <h3 className="font-medium text-lg">Trailer Indisponível</h3>
              </div>
              <button 
                onClick={closeNoTrailerMessage}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <p className="text-gray-300">
              Ops! Parece que ainda não temos um trailer disponível para este filme. Tente novamente mais tarde!
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        {/* Elenco */}
        {movie.credits.cast && movie.credits.cast.filter(actor => actor.profile_path).length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Elenco Principal</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {movie.credits.cast
                .filter(actor => actor.profile_path) // Filtra apenas atores com foto
                .slice(0, 8)
                .map(actor => (
                  <div key={actor.id} className="bg-background-light rounded-lg overflow-hidden">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={getImageUrl(actor.profile_path)}
                        alt={actor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-xs">{actor.name}</h3>
                      <p className="text-gray-400 text-xs">{actor.character}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Filmes Similares */}
        <MovieRow
          title="Filmes Similares"
          movies={movie.similar.results.filter(item => item.poster_path)}
          viewAllLink={`/movie/${movie.id}/similar`}
        />
      </div>

      {/* Player do filme */}
      {showPlayer && (
        <MoviePlayer
          movieId={movie.id}
          title={movie.title}
          mediaType="movie"
          onClose={() => setShowPlayer(false)}
        />
      )}
    </Layout>
  );
};

export default MovieDetails; 