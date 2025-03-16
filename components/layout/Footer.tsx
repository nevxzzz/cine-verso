/**
 * Componente Footer
 * 
 * Este componente representa o rodapé da aplicação, que contém:
 * - Links para categorias e gêneros
 * - Links para páginas institucionais
 * - Informações de contato e redes sociais
 * - Informações de copyright
 */
import React from 'react';
import Link from 'next/link';

/**
 * Componente de rodapé com links de navegação e informações da plataforma
 */
const Footer: React.FC = () => {
  /**
   * Lista de gêneros disponíveis para navegação rápida
   * Cada gênero possui um ID correspondente ao usado na API do TMDB
   */
  const genres = [
    { id: 28, name: 'Ação' },
    { id: 35, name: 'Comédia' },
    { id: 18, name: 'Drama' },
    { id: 10749, name: 'Romance' },
    { id: 27, name: 'Terror' },
    { id: 878, name: 'Ficção Científica' },
    { id: 16, name: 'Animação' },
    { id: 36, name: 'História' }
  ];

  return (
    <footer className="bg-background-alt pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo e Descrição */}
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight mb-4">
              <span className="text-primary">Cine</span>
              <span className="text-white ml-[1px]">Verso</span>
            </h1>
            <p className="text-gray-400 mb-6">
              Sua plataforma de streaming com os melhores filmes e séries. Assista onde e quando quiser.
            </p>
            <div className="flex space-x-4 mt-4">
              <span className="text-primary text-sm">© {new Date().getFullYear()} CineVerso</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/movies" className="text-gray-400 hover:text-primary transition-colors">
                  Filmes
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-gray-400 hover:text-primary transition-colors">
                  Séries
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-gray-400 hover:text-primary transition-colors">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/quero-assistir" className="text-gray-400 hover:text-primary transition-colors">
                  Quero Assistir
                </Link>
              </li>
              <li>
                <Link href="/favoritos" className="text-gray-400 hover:text-primary transition-colors">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/perfil" className="text-gray-400 hover:text-primary transition-colors">
                  Minha Conta
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-400 hover:text-primary transition-colors">
                  Buscar
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-gray-400 hover:text-primary transition-colors">
                  Em Alta
                </Link>
              </li>
            </ul>
          </div>

          {/* Gêneros Populares */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Gêneros Populares</h3>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <Link 
                  key={genre.id} 
                  href={`/categorias/${genre.id}`}
                  className="text-gray-400 hover:text-primary transition-colors py-1"
                >
                  <span className="text-sm">{genre.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex justify-center">
            <p className="text-gray-500 text-sm">
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 