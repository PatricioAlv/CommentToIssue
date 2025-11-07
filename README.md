# Comment → Issue

Extensión de Visual Studio Code que detecta comentarios especiales en tu código y los convierte automáticamente en issues de GitHub.

## ✨ Características

- 🔍 **Escaneo automático**: Detecta comentarios de error en todo el workspace
- 🎯 **Patrón configurable**: Define tu propio formato de comentarios
- 📋 **Vista lateral**: Visualiza todos los comentarios detectados organizados por archivo
- 🚀 **Integración con GitHub**: Crea issues automáticamente con un clic
- 🏷️ **Labels automáticos**: Convierte metadata en labels de GitHub
- 🔗 **Enlaces directos**: Abre archivos en GitHub o copia permalinks
- 💾 **Persistencia local**: Guarda el estado de los comentarios detectados

## 📦 Instalación

### Desde el código fuente

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd CommentToIssue
```

2. Instala las dependencias:
```bash
npm install
```

3. Compila el proyecto:
```bash
npm run compile
```

4. Presiona `F5` para abrir una ventana de Extension Development Host

## 🚀 Configuración inicial

### 1. Configurar GitHub

Abre la configuración de VS Code (`Ctrl+,`) y configura:

```json
{
  "commentToIssue.github.owner": "tu-usuario-o-org",
  "commentToIssue.github.repo": "tu-repositorio"
}
```

### 2. Configurar el token de GitHub

1. Crea un Personal Access Token en GitHub:
   - Ve a https://github.com/settings/tokens
   - Click en "Generate new token (classic)"
   - Selecciona el scope: `repo` (acceso completo a repositorios)
   - Copia el token generado

2. En VS Code, ejecuta el comando:
   - `Ctrl+Shift+P` → "Comment → Issue: Configurar Token"
   - Pega tu token (se guardará de forma segura)

### 3. Personalizar el patrón (opcional)

Por defecto, la extensión detecta comentarios con este formato:
```
// ERROR: mensaje del error [sev:alta; area:auth]
```

Puedes cambiar el patrón regex en la configuración:

```json
{
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

## 📖 Uso

### Formato de comentarios

Escribe comentarios en tu código siguiendo este formato:

```typescript
// ERROR: El usuario no puede iniciar sesión [sev:alta; area:auth]
function login(username: string, password: string) {
  // ...
}

// ERROR: Validar formato de email [sev:media; area:validacion]
const email = getUserEmail();

// ERROR: Optimizar consulta a base de datos [sev:baja; area:performance]
const users = await db.query('SELECT * FROM users');
```

### Escanear el workspace

1. Abre la vista lateral "Comment → Issue" (icono de issues en la barra de actividades)
2. Click en el botón de escaneo o ejecuta: `Ctrl+Shift+P` → "Scan: Buscar comentarios de error"
3. Los comentarios detectados aparecerán agrupados por archivo

### Crear un issue

1. En la vista lateral, haz click derecho sobre un comentario
2. Selecciona "Crear Issue en GitHub"
3. El issue se creará automáticamente con:
   - Título: El mensaje del error
   - Body: Información del archivo, línea y comentario original
   - Labels: Metadata extraída (ej: `sev:alta`, `area:auth`)
4. El número del issue se insertará en el comentario: `[GH-#123]`

### Otros comandos

- **Abrir en GitHub**: Abre el archivo en GitHub (rama actual)
- **Copiar Permalink**: Copia la URL permanente con el commit hash
- **Refrescar**: Actualiza la vista de comentarios

## 🎨 Iconos en la vista

- ⚠️ Amarillo: Comentario sin issue asignado
- ✅ Verde: Comentario con issue creado

## ⚙️ Configuración completa

```json
{
  // Proveedor (por ahora solo GitHub)
  "commentToIssue.provider": "github",
  
  // Configuración de GitHub
  "commentToIssue.github.owner": "mi-usuario",
  "commentToIssue.github.repo": "mi-repo",
  
  // Patrón regex personalizado
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

## 🔧 Desarrollo

### Scripts disponibles

```bash
# Compilar el proyecto
npm run compile

# Compilar y observar cambios
npm run watch

# Ejecutar linter
npm run lint

# Empaquetar la extensión
npm run package
```

### Estructura del proyecto

```
CommentToIssue/
├── src/
│   ├── extension.ts          # Punto de entrada
│   ├── model.ts               # Definición de tipos
│   ├── parser.ts              # Detección de comentarios
│   ├── tree.ts                # TreeView provider
│   └── providers/
│       ├── provider.ts        # Interfaz genérica
│       └── github.ts          # Implementación de GitHub
├── out/                       # Código compilado
├── .vscode/
│   ├── launch.json           # Configuración de debug
│   └── tasks.json            # Tareas de compilación
├── package.json              # Manifiesto de la extensión
├── tsconfig.json             # Configuración de TypeScript
└── README.md                 # Este archivo
```

### Debuggear la extensión

1. Abre el proyecto en VS Code
2. Presiona `F5` para iniciar el modo de desarrollo
3. Se abrirá una nueva ventana con la extensión cargada
4. Puedes poner breakpoints en el código fuente

## 📝 Ejemplos de metadata

La metadata entre corchetes se convierte en labels de GitHub:

```typescript
// ERROR: Mensaje [sev:alta; area:auth]
// → Labels: sev:alta, area:auth

// ERROR: Mensaje [prioridad:urgente; tipo:bug; módulo:login]
// → Labels: prioridad:urgente, tipo:bug, módulo:login

// ERROR: Mensaje [milestone:v2.0]
// → Labels: milestone:v2.0
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 🐛 Problemas conocidos

- La extensión requiere la extensión de Git de VS Code para obtener información del repositorio
- Los permalinks dependen del estado actual del repositorio Git

## 🔮 Roadmap

- [ ] Soporte para GitLab
- [ ] Soporte para Jira
- [ ] Filtros en la vista lateral
- [ ] Estadísticas de comentarios
- [ ] Sincronización bidireccional con GitHub
- [ ] Soporte para múltiples patrones de comentarios

## 💡 Tips

1. **Consistencia**: Usa siempre el mismo formato de metadata en tu equipo
2. **Nomenclatura**: Define nombres claros para severidad y áreas
3. **Token seguro**: Nunca compartas tu Personal Access Token
4. **Commits**: Haz commit después de crear issues para guardar el marcador `[GH-#...]`

---

Hecho con ❤️ para desarrolladores que aman la organización
