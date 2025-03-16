import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import MovieRow from '@/components/home/MovieRow';
import MovieGrid from '@/components/movie/MovieGrid';
import { imdbService } from '@/lib/services/imdb';
import { FaTheaterMasks, FaLaugh, FaHeart, FaRunning, FaGhost, FaChild, FaHistory, FaStar, FaVideo, FaUsers } from 'react-icons/fa';

interface GenrePageProps {
  genres: any[];
  genreMovies: { [key: string]: any[] };
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Buscar a lista de gêneros
    const genresData = await imdbService.getGenres('movie');
    const genres = genresData.genres;

    // Selecionar alguns gêneros populares para exibir na página
    const popularGenres = [
      { id: 28, name: 'Ação' },
      { id: 35, name: 'Comédia' },
      { id: 18, name: 'Drama' },
      { id: 10749, name: 'Romance' },
      { id: 27, name: 'Terror' },
      { id: 878, name: 'Ficção Científica' },
      { id: 16, name: 'Animação' },
      { id: 36, name: 'História' },
      { id: 99, name: 'Documentários' },
      { id: 10751, name: 'Para Toda Família' }
    ].filter(g => genres.some((genre: any) => genre.id === g.id));

    // Buscar filmes para cada gênero
    const genreMoviesPromises = popularGenres.map(async (genre) => {
      const response = await imdbService.get('/discover/movie', {
        with_genres: genre.id,
        sort_by: 'popularity.desc'
      });
      return { genreId: genre.id, movies: response.results.slice(0, 20) };
    });

    const genreMoviesResults = await Promise.all(genreMoviesPromises);
    
    const genreMovies: { [key: string]: any[] } = {};
    genreMoviesResults.forEach(result => {
      genreMovies[result.genreId] = result.movies;
    });

    return {
      props: {
        genres: popularGenres,
        genreMovies
      }
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return {
      props: {
        genres: [],
        genreMovies: {}
      }
    };
  }
};

const CategoriasPage: React.FC<GenrePageProps> = ({ genres, genreMovies }) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Efeito para definir a categoria ativa baseado no parâmetro da URL
  useEffect(() => {
    const { genre } = router.query;
    if (genre) {
      const genreId = Number(genre);
      setActiveCategory(genreId);
    }
  }, [router.query]);

  // Ícones para cada gênero
  const genreIcons: { [key: number]: JSX.Element } = {
    28: <FaRunning />,      // Ação
    35: <FaLaugh />,        // Comédia
    18: <FaTheaterMasks />, // Drama
    10749: <FaHeart />,     // Romance
    27: <FaGhost />,        // Terror
    878: <FaStar />,        // Ficção Científica
    16: <FaChild />,        // Animação
    36: <FaHistory />,      // História
    99: <FaVideo />,        // Documentários
    10751: <FaUsers />      // Para Toda Família
  };

  // Função para atualizar a categoria ativa e a URL
  const handleCategoryChange = (genreId: number) => {
    setActiveCategory(genreId);
    // Atualizar a URL sem recarregar a página
    router.push(`/categorias?genre=${genreId}`, undefined, { shallow: true });
  };

  return (
    <Layout>
      <Head>
        <title>Categorias | CineVerse</title>
        <meta name="description" content="Explore filmes e séries por categorias no CineVerse. Ação, comédia, drama, ficção científica e muito mais." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="pb-10">
        {/* Espaço reservado para compensar o header principal */}
        <div className="h-16"></div>
        
        {/* Título da página */}
        <div className="container mx-auto px-6 pt-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Categorias</h1>
            <p className="text-gray-400">
              Explore filmes e séries por categoria e descubra novos conteúdos para assistir
            </p>
          </div>
        
          {/* Categorias - sem fundo */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                className={`flex items-center px-4 py-2 rounded-full category-button ${
                  activeCategory === null
                    ? 'bg-primary text-white active'
                    : 'bg-background-light text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                <span className="mr-2"><FaTheaterMasks /></span>
                Todos
              </button>

              {genres.map(genre => (
                <button
                  key={genre.id}
                  className={`flex items-center px-4 py-2 rounded-full category-button ${
                    activeCategory === genre.id
                      ? 'bg-primary text-white active'
                      : 'bg-background-light text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleCategoryChange(genre.id)}
                >
                  <span className="mr-2">{genreIcons[genre.id] || <FaTheaterMasks />}</span>
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* Se nenhuma categoria estiver ativa, mostrar o layout de carrossel */}
          {activeCategory === null ? (
            genres.map(genre => (
              <div key={genre.id} id={`genre-${genre.id}`} className="mb-12">
                <MovieRow 
                  title={genre.name} 
                  movies={genreMovies[genre.id] || []} 
                  viewAllLink={`/categorias/${genre.id}`} 
                />
              </div>
            ))
          ) : (
            // Se uma categoria específica estiver ativa, mostrar o layout em grade
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {genres.find(g => g.id === activeCategory)?.name}
              </h2>
              <MovieGrid movies={genreMovies[activeCategory] || []} />
            </div>
          )}
          
          {/* Mensagem quando não há filmes para mostrar */}
          {genres.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400">Nenhuma categoria disponível no momento.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriasPage; 