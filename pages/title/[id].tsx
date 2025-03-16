import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import MovieRow from '@/components/home/MovieRow';
import { FaPlay, FaPlus, FaStar, FaHeart, FaShare, FaDownload } from 'react-icons/fa';

// Dados de exemplo para a página de detalhes
const movieDetails = {
  id: 1,
  title: 'Duna: Parte 2',
  tagline: 'É hora de terminar o que começou.',
  backdrop: '/images/dune2-backdrop.jpg',
  poster: '/images/dune2-poster.jpg',
  overview: 'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Enfrentando uma escolha entre o amor de sua vida e o destino do universo, ele deve evitar um futuro terrível que só ele pode prever.',
  year: '2024',
  duration: '166 min',
  rating: 8.5,
  genres: ['Ficção Científica', 'Aventura', 'Drama'],
  director: 'Denis Villeneuve',
  cast: [
    { name: 'Timothée Chalamet', character: 'Paul Atreides', image: '/images/cast/timothee.jpg' },
    { name: 'Zendaya', character: 'Chani', image: '/images/cast/zendaya.jpg' },
    { name: 'Rebecca Ferguson', character: 'Lady Jessica', image: '/images/cast/rebecca.jpg' },
    { name: 'Javier Bardem', character: 'Stilgar', image: '/images/cast/javier.jpg' },
    { name: 'Josh Brolin', character: 'Gurney Halleck', image: '/images/cast/josh.jpg' },
    { name: 'Austin Butler', character: 'Feyd-Rautha', image: '/images/cast/austin.jpg' }
  ],
  trailer: 'https://www.youtube.com/watch?v=Way9Dexny3w'
};

// Filmes similares de exemplo
const similarMovies = [
  {
    id: 19,
    title: 'Blade Runner 2049',
    poster_path: '/images/blade-runner-poster.jpg',
    release_date: '2017',
    vote_average: 8.0
  },
  {
    id: 20,
    title: 'Arrival',
    poster_path: '/images/arrival-poster.jpg',
    release_date: '2016',
    vote_average: 7.9
  },
  {
    id: 21,
    title: 'Fundação',
    poster_path: '/images/foundation-poster.jpg',
    release_date: '2021',
    vote_average: 7.5
  },
  {
    id: 22,
    title: 'Star Wars: Episódio IX',
    poster_path: '/images/star-wars-poster.jpg',
    release_date: '2019',
    vote_average: 6.5
  },
  {
    id: 23,
    title: 'Avatar: O Caminho da Água',
    poster_path: '/images/avatar-poster.jpg',
    release_date: '2022',
    vote_average: 7.6
  },
  {
    id: 24,
    title: 'Interestelar',
    poster_path: '/images/interstellar-poster.jpg',
    release_date: '2014',
    vote_average: 8.6
  }
];

const TitlePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Na implementação real, você buscaria os detalhes do filme com base no ID
  const movie = movieDetails;

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <Layout>
      <Head>
        <title>{movie.title} | CineVerso</title>
        <meta name="description" content={movie.overview} />
      </Head>

      {/* Hero Section com backdrop */}
      <div className="relative w-full h-[600px]">
        <div className="absolute inset-0 bg-black opacity-50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        
        {/* Imagem de fundo */}
        <div className="relative h-full w-full">
          <Image
            src={movie.backdrop}
            alt={movie.title}
            fill
            priority
            className="object-cover"
          />
        </div>
        
        {/* Conteúdo */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-10">
          <div className="container mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative w-48 h-[300px] shadow-lg rounded-lg overflow-hidden hidden md:block">
              <Image
                src={movie.poster}
                alt={`Poster de ${movie.title}`}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
              <p className="text-gray-300 italic mb-4">{movie.tagline}</p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                <span className="flex items-center">
                  <FaStar className="text-accent mr-1" />
                  <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                </span>
                <span className="text-gray-300">{movie.year}</span>
                <span className="text-gray-300">{movie.duration}</span>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre, index) => (
                    <Link 
                      key={index} 
                      href={`/categorias?genre=${genre.toLowerCase().replace(' ', '-')}`}
                      className="bg-background-light text-sm px-3 py-1 rounded-full hover:bg-primary transition-colors duration-200"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <a 
                  href={movie.trailer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center"
                >
                  <FaPlay className="mr-2" /> Assistir Trailer
                </a>
                <button 
                  className="btn-secondary flex items-center"
                  onClick={() => setIsInWatchlist(!isInWatchlist)}
                >
                  <FaPlus className="mr-2" /> {isInWatchlist ? 'Na Lista' : 'Adicionar à Lista'}
                </button>
                <button 
                  className={`p-3 rounded-full ${isFavorite ? 'bg-primary' : 'bg-background-light hover:bg-background-light'}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <FaHeart className={isFavorite ? 'text-white' : 'text-gray-300'} />
                </button>
                <button className="p-3 rounded-full bg-background-light hover:bg-[#4D4D4D] transition-colors duration-200">
                  <FaShare className="text-gray-300" />
                </button>
                <button className="p-3 rounded-full bg-background-light hover:bg-[#4D4D4D] transition-colors duration-200">
                  <FaDownload className="text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detalhes do Filme */}
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Sinopse</h2>
            <p className="text-gray-300 mb-8">{movie.overview}</p>
            
            <h2 className="text-2xl font-bold mb-4">Elenco Principal</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {movie.cast.map((actor, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={actor.image}
                      alt={actor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm">{actor.name}</h3>
                  <p className="text-gray-400 text-xs">{actor.character}</p>
                </div>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Detalhes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <h3 className="text-gray-400 text-sm">Diretor</h3>
                <p>{movie.director}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Lançamento</h3>
                <p>{movie.year}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Duração</h3>
                <p>{movie.duration}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Gêneros</h3>
                <p>{movie.genres.join(', ')}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-background-alt p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Onde Assistir</h2>
              <p className="text-gray-300 mb-4">Disponível no CineVerso Premium</p>
              <button className="btn-primary w-full mb-3">Assistir Agora</button>
              <button className="btn-secondary w-full">Baixar</button>
            </div>
            
            <div className="bg-background-alt p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Compartilhar</h2>
              <div className="flex justify-between">
                <button className="p-3 rounded-full bg-[#3b5998] hover:opacity-90 transition-opacity">
                  <i className="fab fa-facebook-f text-white"></i>
                </button>
                <button className="p-3 rounded-full bg-[#1da1f2] hover:opacity-90 transition-opacity">
                  <i className="fab fa-twitter text-white"></i>
                </button>
                <button className="p-3 rounded-full bg-[#0e76a8] hover:opacity-90 transition-opacity">
                  <i className="fab fa-linkedin-in text-white"></i>
                </button>
                <button className="p-3 rounded-full bg-[#25D366] hover:opacity-90 transition-opacity">
                  <i className="fab fa-whatsapp text-white"></i>
                </button>
                <button className="p-3 rounded-full bg-[#C13584] hover:opacity-90 transition-opacity">
                  <i className="fab fa-instagram text-white"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filmes Similares */}
      <MovieRow title="Títulos Similares" movies={similarMovies} viewAllLink="/genre/recomendacoes" />
    </Layout>
  );
};

export default TitlePage;