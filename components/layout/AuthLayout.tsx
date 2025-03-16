import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado esquerdo - Gradiente */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-background via-background-alt to-primary/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">CineVerso</h2>
            <p className="text-xl text-gray-300">Sua plataforma de streaming favorita</p>
          </div>
        </div>
      </div>
      
      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo para mobile */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex justify-center">
              <h1 className="text-2xl font-bold text-primary">CineVerso</h1>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 