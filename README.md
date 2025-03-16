<div align="center">
  <h1>CineVerso</h1>
  <p>Um site de filmes e séries 👾</p>
  
  <p>
    <a href="#visão-geral">Visão Geral</a> •
    <a href="#demonstração">Demonstração</a> •
    <a href="#tecnologias">Tecnologias</a> •
    <a href="#funcionalidades">Funcionalidades</a> •
    <a href="#instalação">Instalação</a> •
    <a href="#configuração">Configuração</a> •
    <a href="#estrutura-do-projeto">Estrutura do Projeto</a> •
    <a href="#uso">Uso</a> •
    <a href="#personalização">Personalização</a> •
    <a href="#contribuição">Contribuição</a> •
    <a href="#licença">Licença</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/github/license/nevxzzz/cine-verso" alt="License" />
    <img src="https://img.shields.io/github/stars/nevxzzz/cine-verso" alt="Stars" />
    <img src="https://img.shields.io/github/forks/nevxzzz/cine-verso" alt="Forks" />
    <img src="https://img.shields.io/github/issues/nevxzzz/cine-verso" alt="Issues" />
  </p>
</div>

## Visão Geral

CineVerso é uma plataforma moderna de streaming de filmes e séries desenvolvida com Next.js, TypeScript e Firebase. O projeto oferece uma experiência completa de streaming, com recursos como autenticação de usuários, listas de favoritos, histórico de visualização, e muito mais.

Este projeto é de código aberto e foi criado para compartilhar conhecimento e ideias com a comunidade de desenvolvedores. Sinta-se à vontade para usar, modificar e contribuir com o projeto.

<div align="center">
  <img src="https://raw.githubusercontent.com/nevxzzz/cine-verso/main/screen.png" alt="CineVerso Screenshot" width="80%" />
</div>


## Tecnologias

O CineVerso foi desenvolvido utilizando as seguintes tecnologias:

- **Frontend**:
  - [Next.js](https://nextjs.org/) - Framework React para renderização do lado do servidor
  - [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
  - [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem estática
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
  - [Framer Motion](https://www.framer.com/motion/) - Biblioteca de animações para React
  - [React Slick](https://react-slick.neostack.com/) - Componente de carrossel

- **Backend e Serviços**:
  - [Firebase](https://firebase.google.com/) - Plataforma de desenvolvimento de aplicativos
    - Authentication - Autenticação de usuários
    - Firestore - Banco de dados NoSQL
  - [TMDB API](https://www.themoviedb.org/documentation/api) - API de filmes e séries
  - [Next Auth](https://next-auth.js.org/) - Autenticação para Next.js
  - [Axios](https://axios-http.com/) - Cliente HTTP para requisições à API

- **Ferramentas de Desenvolvimento**:
  - [ESLint](https://eslint.org/) - Linter para JavaScript/TypeScript
  - [Prettier](https://prettier.io/) - Formatador de código

## Funcionalidades

O CineVerso oferece uma ampla gama de funcionalidades para os usuários:

- **Autenticação**:
  - Registro e login de usuários
  - Autenticação com Google
  - Recuperação de senha

- **Navegação e Descoberta**:
  - Página inicial com carrosséis de filmes e séries
  - Navegação por categorias e gêneros
  - Busca avançada de filmes e séries
  - Página de detalhes com informações completas
  - Categorização por gênero, ano, avaliação e popularidade

- **Personalização**:
  - Lista de favoritos
  - Lista "Quero Assistir"
  - Histórico de visualização
  - Perfis de usuário personalizáveis
  - Recomendações personalizadas

- **Reprodução**:
  - Player de vídeo integrado
  - Suporte a filmes e episódios de séries
  - Modo tela cheia

- **Responsividade**:
  - Interface adaptável a diferentes tamanhos de tela
  - Experiência otimizada para dispositivos móveis
  - Design moderno e minimalista com tema escuro

## Instalação

Para instalar e executar o CineVerso localmente, siga os passos abaixo:

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v14 ou superior)
- [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- Conta no [Firebase](https://firebase.google.com/)
- Chave de API do [TMDB](https://www.themoviedb.org/documentation/api)

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/nevxzzz/cine-verso.git
   cd cine-verso
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente (veja a seção [Configuração](#configuração)).

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Acesse o aplicativo em [http://localhost:3000](http://localhost:3000).

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# TMDB API (The Movie Database)
NEXT_PUBLIC_IMDB_API_KEY=your_tmdb_api_key
IMDB_API_KEY=your_tmdb_api_key
```

### Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative a autenticação por e-mail/senha e Google.
3. Crie um banco de dados Firestore.
4. Obtenha as credenciais do projeto e adicione-as ao arquivo `.env.local`.

### TMDB API

1. Crie uma conta no [TMDB](https://www.themoviedb.org/).
2. Obtenha uma chave de API em [API Settings](https://www.themoviedb.org/settings/api).
3. Adicione a chave ao arquivo `.env.local`.

## Estrutura do Projeto

```
cineverse/
├── components/ # Componentes React reutilizáveis
│ ├── home/ # Componentes específicos da página inicial
│ ├── layout/ # Componentes de layout (Header, Footer, etc.)
│ ├── profile/ # Componentes relacionados ao perfil do usuário
│ ├── search/ # Componentes de busca
│ ├── title/ # Componentes para páginas de detalhes de títulos
│ ├── auth/ # Componentes de autenticação
│ └── ui/ # Componentes de UI genéricos
├── lib/ # Funções utilitárias e hooks
│ ├── hooks/ # React hooks personalizados
│ ├── services/ # Serviços de API
│ └── utils/ # Funções utilitárias
├── pages/ # Páginas da aplicação (roteamento Next.js)
│ ├── api/ # Rotas de API
│ ├── auth/ # Páginas de autenticação
│ ├── genre/ # Páginas de gêneros
│ ├── profile/ # Páginas de perfil
│ ├── search/ # Página de busca
│ ├── movie/ # Páginas de detalhes de filmes
│ └── series/ # Páginas de detalhes de séries
├── public/ # Arquivos estáticos
│ └── images/ # Imagens
├── styles/ # Estilos globais
├── types/ # Definições de tipos TypeScript
└── hooks/ # Hooks personalizados globais
```

## Uso

Após a instalação e configuração, você pode usar o CineVerso para:

- Navegar por filmes e séries populares
- Buscar por títulos específicos
- Criar uma conta e fazer login
- Adicionar filmes e séries aos favoritos
- Criar uma lista de "Quero Assistir"
- Assistir filmes e episódios de séries

## Contribuição

Contribuições são bem-vindas! Se você deseja contribuir com o projeto, siga os passos abaixo:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<div align="center">
  <p>Desenvolvido com ❤️ por <a href="https://github.com/nevxzzz">Nevxzzz</a></p>
  <p>Compartilhe ideias, não as guarde para si!</p>
</div>
