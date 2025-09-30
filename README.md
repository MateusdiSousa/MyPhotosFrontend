# Documentação do Projeto MyPhotos - Frontend Angular
## 📋 Visão Geral
O MyPhotos Frontend é uma interface web desenvolvida em Angular para gerenciamento de fotos e vídeos. A aplicação permite visualizar, fazer upload e gerenciar arquivos de mídia, integrando-se com o backend através de API REST e WebSocket para operações em tempo real.

## 🏗️ Arquitetura do Projeto
### Tecnologias Utilizadas
- Angular - Framework principal

- TypeScript - Linguagem de desenvolvimento

- RxJS - Programação reativa

- WebSocket - Comunicação em tempo real para uploads

- HTTP Client - Comunicação com API REST

## Estrutura de Dados

```cmd
src/
├── app/
│   ├── models/          # Interfaces e tipos TypeScript
│   ├── service/        # Serviços Angular
│   ├── components/      # Componentes da aplicação
│   ├── page/           # Páginas/rotas principais
├── environments/
│   └── environment.development.ts    # Configurações do ambiente de desenvolvimento 
│   └── environments.ts    # Configurações do ambiente de produção
├── index.html
├── main.ts
├── style.css
```

## Integração com o backend

### Endpoint da API
Base URL: <b>http://{API_URL}/photos</b>

| Método   | Endpoint               | Descrição                  |
|----------|------------------------|----------------------------|
| GET      | `/photos/view`         | Lista fotos com paginação  |
| DELETE   | `/photos/delete/{id}`  | Remove uma foto            |

### Modelos de Dados

```typescript
type PagePhoto = {
  content: PhotoInfo[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
```
```typescript
type PhotoInfo = {
  id: number;
  createdAt: Date;
  originalFilename: string;
  filePath: string;
  contentType: string;
  size: number;
};
```

```typescript
type MessageResponse = {
  message: string;
}
```

## 🚀 Serviço Principal: PhotoService
### Funcionalidades implementadas

#### 1. Listagem de Fotos com Paginação


```typescript
getPhotos(pageNumber: number = 0, pageSize: number = 50): Observable<PagePhoto>
```
<b>Parâmetros:</b>

* pageNumber: Número da página (padrão: 0)

* pageSize: Quantidade de itens por página (padrão: 50)

<b>Retorno:</b> Observable com dados paginados

#### 2. Exclusão de Fotos
```typescript
deletePhoto(id: number): Observable<MessageResponse>
```

<b>Parâmetros:</b> 
* id: Identificador da foto

<b>Retorno:</b> Mensagem de confirmação

####  3. Upload de Arquivos via WebSocket
Upload Simples (Arquivos Pequenos)

```typescript
sendPhoto(session: WebSocket, file: File)
```
* Para arquivos menores que MAX_SIZE_FILE
* Envio em único pacote

Upload em Chunks (Arquivos Grandes)
```typescript
sendFileByPackage(session: WebSocket, file: File)
```
* Para arquivos maiores que MAX_SIZE_FILE

* Divisão em múltiplos chunks

* Suporte a arquivos de vídeo grandes

### Protocolo de Comunicação WebSocket
#### Estrutura do Protocolo

<b>Tipo 1 - Upload Simples (Foto)</b>

```text
[4 bytes]  Protocolo (1)
[4 bytes]  Tamanho do nome do arquivo (N)
[N bytes]  Nome do arquivo
[4 bytes]  Tamanho do content-type (M)
[M bytes]  Content-type
[8 bytes]  Tamanho do arquivo
[X bytes]  Conteúdo do arquivo
```

<b>Tipo 2 - Upload em Chunks (Vídeo)</b>

```text
[4 bytes]  Protocolo (2)
[16 bytes] UUID da sessão
[4 bytes]  Tamanho do nome do arquivo (N)
[N bytes]  Nome do arquivo
[4 bytes]  Tamanho do content-type (M)
[M bytes]  Content-type
[8 bytes]  Tamanho total do arquivo
[4 bytes]  Número do chunk atual
[4 bytes]  Total de chunks
[X bytes]  Conteúdo do chunk
```

## Configuração

### Variáveis de ambiente
```typescript
// environment.ts
export const environment = {
  production: false,
  API_URL: 'localhost:8080',  // URL do backend
  MAX_SIZE_FILE: 10          // Tamanho máximo em MB para upload simples
};
```

## Instalação e Execução

### Manual
Pré-requisitos
* Node.js 20+
* Angular CLI
* Backend MyPhotos rodando

Comandos:
```bash
# Instalação de dependências
npm install

# Desenvolvimento
ng serve

# Build de produção
ng build --prod

# Execução com configuração específica
ng serve --configuration=production
```

### Docker
Pré-requisitos
* Docker e Docker Compose
* Backend Myphotos rodando

Comandos:
```bash
docker compose up
```

## Estrutura de Componentes
### Componentes Principais

<b>Photo Grid Component:</b> Grid de fotos

<b>Photo Item Component:</b> Card indivídual de foto/vídeo

<b>Photo Upload Component:</b> Interface de upload de arquivos

<b>Pagination Component:</b> Controle de paginação

<b>Photo View Component:</b> Modal de visualização de foto/vídeo

## Funcionalidades da UI

### Galeria
* Visualização em grid responsivo
* Paginação client-side
* Modal de visualização ampliada
* Opções de ordenação

### Upload
* Drag & drop de arquivos
* Progresso de upload em tempo real
* Suporte a múltiplos arquivos
* Validação de tipos e tamanhos

### Gerenciamento
* Exclusão de arquivos
* Metadados de arquivos
* Filtros por data/tipo


## Funcionalidades Futuras
* Lazy Load
* Criação de albums para fotos
* Pasta Trancada
