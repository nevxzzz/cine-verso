# CineVerse - Plataforma de Streaming de Filmes e Séries

CineVerse é uma plataforma moderna de streaming de filmes e séries, desenvolvida com Next.js, React, TypeScript e Tailwind CSS.

## Características

- Design moderno e minimalista com tema escuro
- Interface responsiva para desktop, tablet e dispositivos móveis
- Carrossel de destaque para lançamentos e conteúdos exclusivos
- Categorização por gênero, ano, avaliação e popularidade
- Perfis de usuário personalizáveis
- Sistema de favoritos e lista de reprodução
- Histórico de visualização
- Recomendações personalizadas
- Páginas detalhadas para cada título
- Sistema de busca avançada

## Tecnologias Utilizadas

- **Next.js**: Framework React para renderização do lado do servidor
- **React**: Biblioteca JavaScript para construção de interfaces
- **TypeScript**: Superset tipado de JavaScript
- **Tailwind CSS**: Framework CSS utilitário
- **Framer Motion**: Biblioteca para animações
- **React Slick**: Componente de carrossel
- **Next Auth**: Autenticação para Next.js
- **Axios**: Cliente HTTP para requisições à API

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/cineverse.git
cd cineverse
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Estrutura do Projeto

```
cineverse/
├── components/       # Componentes React reutilizáveis
│   ├── home/         # Componentes específicos da página inicial
│   ├── layout/       # Componentes de layout (Header, Footer, etc.)
│   ├── profile/      # Componentes relacionados ao perfil do usuário
│   ├── search/       # Componentes de busca
│   ├── title/        # Componentes para páginas de detalhes de títulos
│   └── ui/           # Componentes de UI genéricos
├── lib/              # Funções utilitárias e hooks
│   ├── hooks/        # React hooks personalizados
│   └── utils/        # Funções utilitárias
├── pages/            # Páginas da aplicação (roteamento Next.js)
│   ├── api/          # Rotas de API
│   ├── auth/         # Páginas de autenticação
│   ├── genre/        # Páginas de gêneros
│   ├── profile/      # Páginas de perfil
│   ├── search/       # Página de busca
│   └── title/        # Páginas de detalhes de títulos
├── public/           # Arquivos estáticos
│   └── images/       # Imagens
└── styles/           # Estilos globais
```

## Personalização

O tema e as cores podem ser personalizados no arquivo `tailwind.config.js`. As principais cores utilizadas são:

- Background: `#121212`
- Background Alt: `#232323`
- Background Light: `#3D3D3D`
- Primary: `#E50914` (vermelho)
- Accent: `#FFD700` (dourado)

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Contato

Para qualquer dúvida ou sugestão, entre em contato através do email: seu-email@exemplo.com 