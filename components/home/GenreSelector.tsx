/**
 * Componente GenreSelector
 * 
 * Exibe uma grade de gêneros de filmes e séries para navegação rápida
 * Cada gênero é representado por um card com ícone e nome, que redireciona para a página de categoria
 */
import React from 'react';
import Link from 'next/link';
import { FaTheaterMasks, FaLaugh, FaHeart, FaRunning, FaGhost, FaChild, FaHistory, FaStar } from 'react-icons/fa';

/**
 * Interface que define a estrutura de um gênero
 * @property id - ID do gênero conforme definido na API do TMDB
 * @property name - Nome do gênero em português
 * @property icon - Ícone React que representa visualmente o gênero
 */
interface Genre {
  id: number;
  name: string;
  icon: React.ReactNode;
}

/**
 * Lista de gêneros disponíveis para navegação
 * Cada gênero possui um ID correspondente ao usado na API do TMDB,
 * um nome em português e um ícone representativo
 */
const genres: Genre[] = [
  { id: 28, name: 'Ação', icon: <FaRunning /> },
  { id: 35, name: 'Comédia', icon: <FaLaugh /> },
  { id: 18, name: 'Drama', icon: <FaTheaterMasks /> },
  { id: 10749, name: 'Romance', icon: <FaHeart /> },
  { id: 27, name: 'Terror', icon: <FaGhost /> },
  { id: 878, name: 'Ficção Científica', icon: <FaStar /> },
  { id: 16, name: 'Animação', icon: <FaChild /> },
  { id: 36, name: 'História', icon: <FaHistory /> }
];

/**
 * Componente que exibe uma grade de gêneros para navegação
 * Permite ao usuário explorar filmes e séries por categoria
 */
const GenreSelector: React.FC = () => {
  return (
    <section className="py-8 mb-8">
      {/* Cabeçalho da seção */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading">Explorar por Gênero</h2>
        <p className="text-gray-400 mt-1">Descubra filmes e séries por categoria</p>
      </div>
      
      {/* Grade de gêneros */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 md:mx-auto md:max-w-4xl">
        {genres.map((genre) => (
          <Link 
            key={genre.id} 
            href={`/categorias?genre=${genre.id}`}
            className="bg-background-alt p-3 rounded-lg flex items-center hover:bg-background-light hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-gray-800 relative pl-14 min-h-[3.5rem]"
          >
            {/* Círculo com ícone do gênero */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0 absolute left-3 top-1/2 -translate-y-1/2">
              {genre.icon}
            </div>
            {/* Nome do gênero */}
            <span className="font-medium text-sm">
              {genre.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default GenreSelector; 