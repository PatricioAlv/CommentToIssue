# 🎨 Arquitectura de Comment → Issue

```
┌─────────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   extension.ts (Main)                     │  │
│  │  • activate() - Punto de entrada                          │  │
│  │  • Registra comandos                                      │  │
│  │  • Inicializa TreeView                                    │  │
│  │  • Gestiona ciclo de vida                                 │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │                                                 │
│  ┌─────────────┼─────────────────────────────┐                 │
│  │             │                             │                 │
│  ▼             ▼                             ▼                 │
│                                                                 │
│ ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐ │
│ │ Commands │  │ TreeView │  │   Parser   │  │   Providers  │ │
│ └──────────┘  └──────────┘  └────────────┘  └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Componentes Principales

### 1️⃣ extension.ts - Controlador Principal
```
┌─────────────────────────────────────────┐
│         extension.ts                    │
├─────────────────────────────────────────┤
│ • activate(context)                     │
│   ├─ Inicializa TreeProvider            │
│   ├─ Inicializa GitHubProvider          │
│   ├─ Registra 7 comandos                │
│   └─ Carga comentarios guardados        │
│                                          │
│ • Comandos registrados:                 │
│   ├─ scan                                │
│   ├─ createIssue                         │
│   ├─ openOnRemote                        │
│   ├─ copyPermalink                       │
│   ├─ refresh                             │
│   ├─ goToComment                         │
│   └─ configureToken                      │
│                                          │
│ • deactivate()                           │
└─────────────────────────────────────────┘
```

### 2️⃣ tree.ts - Vista Lateral
```
┌─────────────────────────────────────────┐
│         tree.ts                          │
├─────────────────────────────────────────┤
│ CommentTreeItem                          │
│   ├─ label                               │
│   ├─ icon (⚠️ amarillo / ✅ verde)      │
│   ├─ command (onClick → goToComment)    │
│   └─ contextValue (para menú)           │
│                                          │
│ CommentTreeProvider                      │
│   ├─ setComments(comments[])            │
│   ├─ refresh()                           │
│   ├─ getTreeItem()                       │
│   ├─ getChildren()                       │
│   │   ├─ Nivel 1: Archivos              │
│   │   └─ Nivel 2: Comentarios           │
│   └─ updateComment(file, line, issue#)  │
└─────────────────────────────────────────┘
```

### 3️⃣ parser.ts - Detector de Comentarios
```
┌─────────────────────────────────────────┐
│         parser.ts                        │
├─────────────────────────────────────────┤
│ scanWorkspace()                          │
│   ├─ Busca archivos (*.ts, *.js, etc.) │
│   ├─ Excluye node_modules               │
│   └─ Retorna ReportComment[]            │
│                                          │
│ scanFile(uri, pattern)                   │
│   ├─ Lee contenido del archivo          │
│   ├─ Aplica regex pattern               │
│   ├─ Extrae mensaje                     │
│   ├─ Parsea metadata [key:value]        │
│   └─ Detecta issue asignado [GH-#123]   │
│                                          │
│ parseMetadata(str)                       │
│   └─ "sev:alta; area:auth"              │
│       → { sev: 'alta', area: 'auth' }   │
│                                          │
│ saveComments(comments[])                 │
│   └─ Guarda en .comment-to-issue.json   │
│                                          │
│ loadComments()                           │
│   └─ Carga desde .comment-to-issue.json │
└─────────────────────────────────────────┘
```

### 4️⃣ providers/github.ts - Integración GitHub
```
┌─────────────────────────────────────────┐
│       providers/github.ts                │
├─────────────────────────────────────────┤
│ GitHubProvider implements IssueProvider  │
│                                          │
│ initialize()                             │
│   ├─ Lee config (owner, repo)           │
│   ├─ Lee token de SecretStorage         │
│   └─ Inicializa Octokit                 │
│                                          │
│ createIssue(comment)                     │
│   ├─ Prepara labels desde metadata      │
│   ├─ Genera body con info del archivo   │
│   ├─ Llama GitHub API (Octokit)         │
│   └─ Retorna IssueInfo (number, url)    │
│                                          │
│ getRemoteUrl(file, line)                 │
│   └─ github.com/.../blob/branch/file#L  │
│                                          │
│ getPermalink(file, line)                 │
│   └─ github.com/.../blob/commit/file#L  │
│                                          │
│ isConfigured()                           │
│   └─ Verifica owner, repo, token        │
│                                          │
│ configureGitHubToken(context)            │
│   └─ Pide token y guarda en SecretStorage│
└─────────────────────────────────────────┘
```

### 5️⃣ model.ts - Definiciones de Tipos
```
┌─────────────────────────────────────────┐
│         model.ts                         │
├─────────────────────────────────────────┤
│ interface ReportComment {                │
│   file: string                           │
│   line: number                           │
│   text: string                           │
│   message: string                        │
│   metadata: Record<string, string>       │
│   issueNumber?: number                   │
│ }                                        │
│                                          │
│ interface GitHubConfig {                 │
│   owner: string                          │
│   repo: string                           │
│   token: string                          │
│ }                                        │
│                                          │
│ interface IssueInfo {                    │
│   number: number                         │
│   url: string                            │
│   htmlUrl: string                        │
│ }                                        │
└─────────────────────────────────────────┘
```

### 6️⃣ providers/provider.ts - Interfaz Genérica
```
┌─────────────────────────────────────────┐
│      providers/provider.ts               │
├─────────────────────────────────────────┤
│ interface IssueProvider {                │
│   createIssue(comment)                   │
│   getRemoteUrl(file, line)               │
│   getPermalink(file, line)               │
│   isConfigured()                         │
│ }                                        │
│                                          │
│ 💡 Permite extender a:                   │
│   • GitLab                               │
│   • Jira                                 │
│   • Azure DevOps                         │
│   • etc.                                 │
└─────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Flujo 1: Escaneo de Comentarios
```
Usuario presiona "Scan"
    │
    ▼
extension.ts (scan command)
    │
    ▼
parser.scanWorkspace()
    │
    ├─ findFiles(**/*.ts, etc.)
    │
    ├─ Para cada archivo:
    │   └─ scanFile(uri, pattern)
    │       ├─ Aplicar regex
    │       ├─ Extraer mensaje
    │       └─ Parsear metadata
    │
    ▼
Retorna ReportComment[]
    │
    ▼
treeProvider.setComments(comments)
    │
    ▼
parser.saveComments(comments)
    │
    ▼
TreeView se actualiza
```

### Flujo 2: Creación de Issue
```
Usuario: Click derecho → "Crear Issue"
    │
    ▼
extension.ts (createIssue command)
    │
    ├─ Verificar isConfigured()
    │   ├─ No → Mostrar error
    │   └─ Sí → Continuar
    │
    ▼
githubProvider.createIssue(comment)
    │
    ├─ Preparar labels (metadata)
    ├─ Generar body (archivo, línea, texto)
    ├─ Octokit.rest.issues.create()
    │
    ▼
Retorna IssueInfo (number, url)
    │
    ▼
insertIssueNumberInFile(comment, number)
    │   └─ Añade [GH-#123] al comentario
    │
    ▼
treeProvider.updateComment(file, line, number)
    │
    ▼
saveComments(updatedComments)
    │
    ▼
Notificación de éxito ✅
```

### Flujo 3: Navegación al Código
```
Usuario: Click en comentario del TreeView
    │
    ▼
CommentTreeItem.command ejecutado
    │
    ▼
extension.ts (goToComment command)
    │
    ├─ openTextDocument(filePath)
    ├─ showTextDocument(document)
    ├─ Posicionar cursor en línea
    └─ Revelar en centro
```

## 🗂️ Estructura de Archivos

```
CommentToIssue/
│
├── 📂 src/                       # Código fuente TypeScript
│   ├── extension.ts              # ⭐ Punto de entrada
│   ├── model.ts                  # 📋 Tipos e interfaces
│   ├── parser.ts                 # 🔍 Detección de comentarios
│   ├── tree.ts                   # 🌳 TreeView provider
│   └── 📂 providers/
│       ├── provider.ts           # 🔌 Interfaz genérica
│       └── github.ts             # 🐙 Implementación GitHub
│
├── 📂 out/                       # Código JavaScript compilado
│   ├── extension.js
│   ├── model.js
│   ├── parser.js
│   ├── tree.js
│   └── 📂 providers/
│       ├── provider.js
│       └── github.js
│
├── 📂 .vscode/                   # Configuración de VS Code
│   ├── launch.json               # Debug (F5)
│   └── tasks.json                # Tareas de build
│
├── 📂 examples/                  # Archivos de ejemplo
│   └── example-service.ts
│
├── 📄 package.json               # Manifiesto de extensión
├── 📄 tsconfig.json              # Config de TypeScript
├── 📄 .eslintrc.js               # Config de ESLint
├── 📄 .gitignore                 # Git ignore
├── 📄 .vscodeignore              # Packaging ignore
│
└── 📚 Documentación
    ├── README.md                 # Guía principal
    ├── QUICKSTART.md             # Inicio rápido
    ├── PROJECT_SUMMARY.md        # Resumen técnico
    ├── CONFIGURATION_EXAMPLES.md # Ejemplos de config
    ├── CHECKLIST.md              # Lista de verificación
    └── ARCHITECTURE.md           # Este archivo
```

## 🔐 Seguridad y Almacenamiento

```
┌─────────────────────────────────────────┐
│      Almacenamiento de Datos             │
├─────────────────────────────────────────┤
│                                          │
│  🔒 SecretStorage (Encriptado)          │
│      └─ github.token                    │
│                                          │
│  ⚙️  Settings (JSON)                     │
│      ├─ commentToIssue.provider         │
│      ├─ commentToIssue.github.owner     │
│      ├─ commentToIssue.github.repo      │
│      └─ commentToIssue.pattern          │
│                                          │
│  💾 Workspace Local                      │
│      └─ .comment-to-issue.json          │
│          (comentarios escaneados)        │
│                                          │
└─────────────────────────────────────────┘
```

## 🎨 UI Components

```
┌─────────────────────────────────────────────────────────────┐
│  Activity Bar                                                │
│  ┌─────┐                                                     │
│  │ ... │                                                     │
│  │ 📋  │ ← Comment → Issue icon                             │
│  │ ... │                                                     │
│  └─────┘                                                     │
├─────────────────────────────────────────────────────────────┤
│  Sidebar - "Errores detectados"                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🔍 Scan  🔄 Refresh                     [Botones]    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  📄 example-service.ts (8)                            │  │
│  │    ├─ ⚠️  Línea 11: Validar email...                 │  │
│  │    ├─ ⚠️  Línea 16: Implementar...                   │  │
│  │    ├─ ⚠️  Línea 21: Agregar rate...                  │  │
│  │    └─ ✅ Línea 30: Optimizar... [GH-#42]             │  │
│  │                                                        │  │
│  │  📄 user-service.ts (3)                               │  │
│  │    ├─ ⚠️  Línea 5: Fix bug...                        │  │
│  │    └─ ...                                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  [Click derecho en comentario]                              │
│  ┌────────────────────────────┐                             │
│  │ Crear Issue en GitHub      │                             │
│  │ Abrir en GitHub            │                             │
│  │ Copiar Permalink           │                             │
│  └────────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Integración con APIs

```
┌─────────────────────────────────────────┐
│         GitHub API (Octokit)             │
├─────────────────────────────────────────┤
│                                          │
│  POST /repos/{owner}/{repo}/issues       │
│  {                                       │
│    title: "mensaje",                    │
│    body: "archivo, línea, contexto",    │
│    labels: ["sev:alta", "area:auth"]    │
│  }                                       │
│                                          │
│  Response:                               │
│  {                                       │
│    number: 123,                          │
│    url: "api.github.com/...",           │
│    html_url: "github.com/.../issues/123" │
│  }                                       │
│                                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         VS Code Git Extension            │
├─────────────────────────────────────────┤
│                                          │
│  git.repositories[0].state.HEAD          │
│    ├─ .name → "main"                    │
│    └─ .commit → "abc123..."             │
│                                          │
│  Usado para:                             │
│    • getRemoteUrl() → branch name       │
│    • getPermalink() → commit hash       │
│                                          │
└─────────────────────────────────────────┘
```

## 🎯 Puntos de Extensión

### Agregar nuevo proveedor (ej: GitLab)

```typescript
// src/providers/gitlab.ts

export class GitLabProvider implements IssueProvider {
  async createIssue(comment: ReportComment): Promise<IssueInfo> {
    // Implementar con GitLab API
  }
  
  async getRemoteUrl(file: string, line: number): Promise<string> {
    // gitlab.com/...
  }
  
  // ... otros métodos
}
```

### Agregar nuevo comando

```typescript
// En extension.ts

const myCommand = vscode.commands.registerCommand(
  'commentToIssue.myCommand',
  async () => {
    // Tu lógica aquí
  }
);

context.subscriptions.push(myCommand);
```

### Cambiar formato de comentarios

```json
// En package.json
{
  "commentToIssue.pattern": {
    "default": "TU_PATRON_REGEX_AQUI"
  }
}
```

---

**Diseñado con ❤️ para ser extensible y mantenible**
