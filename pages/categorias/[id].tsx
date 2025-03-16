import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaPlay } from 'react-icons/fa';
import { getImageUrl } from '@/lib/services/imdb';
import { getMoviesByGenre } from '@/lib/services/tmdb';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

export default function CategoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      if (id) {
        try {
          const data = await getMoviesByGenre(Number(id));
          setMovies(data.results);
        } catch (err) {
          setError('Erro ao carregar filmes');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMovies();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;
  if (!id) return <div>Categoria não encontrada</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Filmes da Categoria</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="relative group">
            <Link href={`/movie/${movie.id}`}>
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4">
                  <h3 className="text-center font-semibold mb-2">{movie.title}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <FaStar className="text-yellow-500" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                    <span className="text-gray-400">
                      ({new Date(movie.release_date).getFullYear()})
                    </span>
                  </div>
                  <button className="btn-primary py-1 px-4 flex items-center text-sm">
                    <FaPlay className="mr-2" size={12} /> Assistir
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 