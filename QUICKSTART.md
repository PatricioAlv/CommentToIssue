# 🚀 Guía de Inicio Rápido

## Paso 1: Instalar dependencias

```bash
npm install
```

## Paso 2: Compilar el proyecto

```bash
npm run compile
```

O para desarrollo continuo (recompila automáticamente):

```bash
npm run watch
```

## Paso 3: Ejecutar la extensión

1. Presiona `F5` en VS Code
2. Se abrirá una nueva ventana "Extension Development Host"
3. La extensión estará activa en esa ventana

## Paso 4: Configurar GitHub

### Opción A: Desde la configuración de VS Code

1. En la ventana de desarrollo, abre Settings (`Ctrl+,`)
2. Busca "Comment to Issue"
3. Configura:
   - `Comment To Issue: Github Owner` → tu usuario o organización
   - `Comment To Issue: Github Repo` → nombre del repositorio

### Opción B: Editar settings.json directamente

```json
{
  "commentToIssue.github.owner": "tu-usuario",
  "commentToIssue.github.repo": "tu-repo"
}
```

## Paso 5: Configurar el token de GitHub

1. Crea un token en: https://github.com/settings/tokens
   - Click en "Generate new token (classic)"
   - Selecciona scope: `repo`
   - Copia el token

2. En VS Code (ventana de desarrollo):
   - `Ctrl+Shift+P`
   - Escribe: "Comment → Issue: Configure Token"
   - Pega tu token

## Paso 6: Probar la extensión

### Abrir el archivo de ejemplo

El proyecto incluye `examples/example-service.ts` con comentarios de prueba.

### Escanear comentarios

1. Abre la vista lateral "Comment → Issue" (icono de issues en la barra lateral)
2. Click en el botón de escaneo (parte superior de la vista)
3. Verás los comentarios detectados agrupados por archivo

### Crear un issue

1. Expande un archivo en la vista
2. Click derecho sobre un comentario
3. Selecciona "Crear Issue en GitHub"
4. ✅ El issue se creará y el número se insertará en el código

## 📋 Comandos disponibles

Presiona `Ctrl+Shift+P` y escribe:

- **Scan: Buscar comentarios de error** - Escanea el workspace
- **Comment → Issue: Configure Token** - Configura el token de GitHub
- **Comment → Issue: Crear Issue en GitHub** - (desde menú contextual)
- **Comment → Issue: Abrir en GitHub** - (desde menú contextual)
- **Comment → Issue: Copiar Permalink** - (desde menú contextual)

## 🎯 Formato de comentarios

```typescript
// ERROR: Tu mensaje aquí [sev:alta; area:auth]
```

**Componentes:**
- `ERROR:` - Palabra clave (configurable)
- `Tu mensaje aquí` - Descripción del problema
- `[sev:alta; area:auth]` - Metadata (opcional, se convierte en labels)

## 🐛 Troubleshooting

### "No se encuentra el módulo vscode"

Solución: Ejecuta `npm install`

### "GitHub no está configurado"

Verifica:
1. Settings: `commentToIssue.github.owner` y `repo` están configurados
2. Token: Ejecuta el comando "Configure Token"

### Los comentarios no se detectan

Verifica:
1. El formato del comentario sigue el patrón configurado
2. El archivo está incluido en los tipos soportados (.ts, .js, .py, etc.)
3. El archivo no está en node_modules

### Error de autenticación con GitHub

1. Verifica que el token tenga el scope `repo`
2. El token no haya expirado
3. Reconfigura el token con el comando "Configure Token"

## 📦 Empaquetar la extensión

Para crear un archivo .vsix instalable:

```bash
npm install -g @vscode/vsce
npm run package
```

Esto generará `comment-to-issue-0.0.1.vsix`

Para instalar:
1. VS Code → Extensions
2. Click en "..." → Install from VSIX
3. Selecciona el archivo .vsix

## 🔧 Desarrollo

### Estructura de archivos

```
src/
├── extension.ts       # Punto de entrada, registra comandos
├── model.ts          # Tipos e interfaces
├── parser.ts         # Escaneo de archivos y detección
├── tree.ts           # Provider del TreeView
└── providers/
    ├── provider.ts   # Interfaz genérica
    └── github.ts     # Implementación GitHub (Octokit)
```

### Agregar soporte para otros lenguajes

En `parser.ts`, línea 18:

```typescript
const files = await vscode.workspace.findFiles(
  '**/*.{ts,js,tsx,jsx,py,java,cs,cpp,c,go,rb,php,NUEVO_EXTENSION}',
  '**/node_modules/**'
);
```

### Cambiar el patrón por defecto

En `package.json`, busca:

```json
"commentToIssue.pattern": {
  "default": "TU_NUEVO_PATRON_REGEX"
}
```

## 🎓 Recursos adicionales

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Octokit REST API](https://octokit.github.io/rest.js/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

¡Disfruta usando Comment → Issue! 🎉
