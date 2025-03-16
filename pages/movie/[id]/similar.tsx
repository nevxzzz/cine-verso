import React, { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import { imdbService, getImageUrl } from '@/lib/services/imdb';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaPlay, FaStar, FaImage } from 'react-icons/fa';
import { useRouter } from 'next/router';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  media_type?: 'movie' | 'tv';
}

interface SimilarMoviesProps {
  movieId: string;
  movieTitle: string;
  similarMovies: Movie[];
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const movieId = params?.id as string;
    
    // Buscar detalhes do filme original para obter o título
    const movieDetails = await imdbService.get(`/movie/${movieId}`, {});
    
    // Buscar filmes similares
    const similarData = await imdbService.get(`/movie/${movieId}/similar`, {});
    
    // Adicionar media_type para garantir que os links sejam corretos
    const similarMoviesWithType = similarData.results
      .filter((movie: any) => movie.poster_path) // Filtrar filmes sem poster_path
      .map((movie: any) => ({
        ...movie,
        media_type: 'movie'
      }));
    
    return {
      props: {
        movieId,
        movieTitle: movieDetails.title,
        similarMovies: similarMoviesWithType || []
      }
    };
  } catch (error) {
    console.error('Erro ao carregar filmes similares:', error);
    return {
      notFound: true
    };
  }
};

const SimilarMoviesPage: React.FC<SimilarMoviesProps> = ({ movieId, movieTitle, similarMovies }) => {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // Função para determinar o link correto com base no tipo de mídia
  const getDetailLink = (movie: Movie) => {
    // Como estamos na página de filmes similares, todos devem ser filmes
    // Mas por segurança, verificamos o media_type
    return `/movie/${movie.id}`;
  };

  // Função para lidar com erro de carregamento de imagem
  const handleImageError = (movieId: number) => {
    setImageErrors(prev => ({ ...prev, [movieId]: true }));
  };

  // Filtra filmes com erros de imagem
  const validMovies = similarMovies.filter(movie => !imageErrors[movie.id]);
  
  return (
    <Layout>
      <Head>
        <title>Filmes Similares a {movieTitle} | CineVerso</title>
        <meta name="description" content={`Descubra filmes similares a ${movieTitle}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-6 py-12 mt-16">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="btn-secondary flex items-center gap-2 hover:bg-opacity-80 transition-all duration-200"
          >
            <FaArrowLeft /> Voltar
          </button>
          <h1 className="text-3xl font-bold ml-4">Filmes Similares a {movieTitle}</h1>
        </div>

        {validMovies.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <FaImage className="text-gray-600 mb-4" size={48} />
              <p className="text-xl text-gray-400">Nenhum filme similar encontrado.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {validMovies.map((movie) => (
              <div key={movie.id} className="relative w-[180px]">
                <Link href={getDetailLink(movie)}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden movie-card-hover group">
                    <Image
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(movie.id)}
                    />
                    
                    {/* Overlay ao passar o mouse */}
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-center text-sm font-semibold mb-2 truncate w-full">
                        {movie.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <FaStar className="text-accent" size={12} />
                        <span>{movie.vote_average.toFixed(1)}</span>
                        <span className="text-gray-400">
                          {movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : ''}
                        </span>
                      </div>
                      <button className="btn-primary py-1 px-4 flex items-center text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(getDetailLink(movie));
                        }}
                      >
                        <FaPlay className="mr-2" size={12} /> Assistir
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="mt-2 text-sm font-medium truncate">
                    {movie.title}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SimilarMoviesPage; 