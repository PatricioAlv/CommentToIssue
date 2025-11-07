# 🚀 Guía de Publicación - Comment → Issue

Esta guía te ayudará a publicar la extensión en el VS Code Marketplace.

## 📋 Prerrequisitos

### 1. Cuenta de Azure DevOps
- Crear cuenta en: https://dev.azure.com
- Necesaria para obtener Personal Access Token

### 2. Publisher en VS Code Marketplace
- Crear publisher en: https://marketplace.visualstudio.com/manage
- Necesitarás un nombre único para tu publisher

### 3. Instalar vsce (VS Code Extensions CLI)
```bash
npm install -g @vscode/vsce
```

## 🔧 Preparación del Proyecto

### 1. Actualizar package.json

Verifica que tengas estos campos correctos:

```json
{
  "name": "comment-to-issue",
  "displayName": "Comment → Issue",
  "description": "Detecta comentarios en el código y los convierte en issues de GitHub",
  "version": "0.0.1",
  "publisher": "TU-PUBLISHER-ID",  // ⚠️ CAMBIAR ESTO
  "icon": "images/icon.png",        // ⚠️ Agregar icono (128x128)
  "repository": {
    "type": "git",
    "url": "https://github.com/TU-USUARIO/comment-to-issue.git"  // ⚠️ CAMBIAR
  },
  "bugs": {
    "url": "https://github.com/TU-USUARIO/comment-to-issue/issues"  // ⚠️ CAMBIAR
  },
  "homepage": "https://github.com/TU-USUARIO/comment-to-issue#readme",  // ⚠️ CAMBIAR
  "license": "MIT",
  "keywords": [
    "github",
    "issues",
    "comments",
    "productivity",
    "project-management"
  ],
  "categories": [
    "Other"
  ]
}
```

### 2. Crear Icono de la Extensión

Crear archivo `images/icon.png`:
- Tamaño: 128x128 píxeles
- Formato: PNG
- Fondo transparente recomendado
- Representa la extensión (ej: icono de issue + comentario)

### 3. Crear Licencia (Opcional pero recomendado)

Crear archivo `LICENSE`:

```
MIT License

Copyright (c) 2025 TU NOMBRE

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 4. Actualizar .vscodeignore

Asegurar que excluye archivos innecesarios:

```
.vscode/**
.vscode-test/**
src/**
.gitignore
.eslintrc.js
tsconfig.json
**/*.map
**/*.ts
!out/**/*.js
node_modules/**
*.vsix
examples/**
.comment-to-issue.json
PROJECT_SUMMARY.md
QUICKSTART.md
CHECKLIST.md
ARCHITECTURE.md
CONFIGURATION_EXAMPLES.md
.git/**
```

### 5. Agregar Screenshots (Opcional)

Crear carpeta `images/` y agregar capturas:
- `screenshot-1.png` - Vista principal
- `screenshot-2.png` - TreeView con comentarios
- `screenshot-3.png` - Creación de issue

Añadir al README.md:
```markdown
## Screenshots

![TreeView](images/screenshot-1.png)
![Creating Issue](images/screenshot-2.png)
```

## 🔑 Obtener Personal Access Token

### 1. Ir a Azure DevOps
https://dev.azure.com

### 2. Crear PAT
1. Click en User Settings → Personal Access Tokens
2. New Token
3. Configuración:
   - **Name**: VS Code Marketplace
   - **Organization**: All accessible organizations
   - **Expiration**: Custom defined (ej: 1 año)
   - **Scopes**: 
     - ✅ Marketplace → **Manage** (seleccionar todo)
4. Crear y copiar el token (guardarlo de forma segura)

## 📦 Empaquetar la Extensión

### 1. Limpiar y compilar

```bash
# Limpiar
rm -rf out node_modules

# Reinstalar dependencias (solo producción)
npm install --production

# Compilar
npm run compile
```

### 2. Crear package

```bash
vsce package
```

Esto generará: `comment-to-issue-0.0.1.vsix`

### 3. Probar el paquete localmente

Instalar el .vsix:
1. VS Code → Extensions
2. "..." (menú) → Install from VSIX
3. Seleccionar `comment-to-issue-0.0.1.vsix`
4. Probar todas las funcionalidades

## 🌐 Publicar en Marketplace

### Opción 1: Usando vsce (CLI)

```bash
# Login (usando el PAT de Azure DevOps)
vsce login TU-PUBLISHER-ID

# Publicar
vsce publish
```

### Opción 2: Usando la Web

1. Ir a: https://marketplace.visualstudio.com/manage
2. Click en tu publisher
3. New Extension → Visual Studio Code
4. Upload el archivo .vsix
5. Completar formulario y publicar

## 📈 Actualizar Versión

### 1. Actualizar version en package.json

```json
{
  "version": "0.0.2"  // Incrementar
}
```

### 2. Seguir versionado semántico

- `MAJOR.MINOR.PATCH` (ej: 1.2.3)
- **MAJOR**: Cambios incompatibles
- **MINOR**: Nuevas funcionalidades (compatible)
- **PATCH**: Bug fixes (compatible)

### 3. Publicar actualización

```bash
# Opción A: Incrementar automáticamente
vsce publish patch  # 0.0.1 → 0.0.2
vsce publish minor  # 0.0.2 → 0.1.0
vsce publish major  # 0.1.0 → 1.0.0

# Opción B: Versión específica
vsce publish 1.0.0
```

## 📝 Changelog

Crear archivo `CHANGELOG.md`:

```markdown
# Changelog

## [0.0.2] - 2025-01-15
### Added
- Soporte para múltiples repositorios
- Filtros en TreeView

### Fixed
- Bug al crear issues con caracteres especiales

## [0.0.1] - 2025-01-10
### Added
- Release inicial
- Detección de comentarios
- Integración con GitHub
- TreeView lateral
```

## ✅ Checklist Pre-Publicación

### Código
- [ ] Compilado sin errores (`npm run compile`)
- [ ] Sin warnings de ESLint (`npm run lint`)
- [ ] Todas las funcionalidades probadas
- [ ] Código comentado y limpio

### Documentación
- [ ] README.md actualizado
- [ ] CHANGELOG.md creado
- [ ] Screenshots agregadas
- [ ] Ejemplos de configuración

### Package.json
- [ ] `publisher` configurado
- [ ] `version` correcta
- [ ] `description` clara
- [ ] `repository` configurado
- [ ] `keywords` relevantes
- [ ] `icon` agregado
- [ ] `categories` correctas
- [ ] `license` especificada

### Archivos
- [ ] LICENSE creado
- [ ] .vscodeignore actualizado
- [ ] Icon (128x128) creado
- [ ] Screenshots agregadas

### Testing
- [ ] Probado en Windows
- [ ] Probado en macOS (si es posible)
- [ ] Probado en Linux (si es posible)
- [ ] .vsix instalado y probado localmente

### Marketplace
- [ ] Publisher creado
- [ ] PAT obtenido
- [ ] vsce instalado

## 🎯 Estrategia de Lanzamiento

### Pre-lanzamiento (Beta)

```json
{
  "version": "0.0.1-beta.1"
}
```

- Publicar como pre-release
- Compartir con usuarios beta
- Recoger feedback
- Iterar

### Lanzamiento Oficial

```json
{
  "version": "1.0.0"
}
```

- Todas las features completas
- Documentación completa
- Testing exhaustivo
- Anuncio en redes sociales

## 📣 Promoción

### 1. GitHub
- Crear release en GitHub
- Agregar tag de versión
- Incluir changelog

### 2. Redes Sociales
- Twitter/X
- LinkedIn
- Reddit (r/vscode)
- Dev.to

### 3. Comunidades
- VS Code Discord
- Stack Overflow
- Foros de desarrolladores

## 🔧 Mantenimiento Post-Publicación

### Monitorear
- ⭐ Ratings y reviews
- 🐛 Issues reportadas
- 💬 Feedback de usuarios
- 📊 Estadísticas de descargas

### Responder
- Issues en GitHub
- Reviews en Marketplace
- Preguntas de usuarios

### Actualizar
- Bug fixes regularmente
- Nuevas features basadas en feedback
- Mantener documentación actualizada

## 🚨 Troubleshooting Publicación

### Error: "Publisher not found"
**Solución**: Crear publisher en marketplace.visualstudio.com

### Error: "Invalid PAT"
**Solución**: 
- Verificar que el PAT tenga scope "Marketplace: Manage"
- PAT no expirado
- Usar `vsce login` nuevamente

### Error: "Version already exists"
**Solución**: Incrementar version en package.json

### Error: "Icon not found"
**Solución**: 
- Crear `images/icon.png` (128x128)
- Actualizar path en package.json

### Warning: "Missing repository"
**Solución**: Agregar campo `repository` en package.json

## 📚 Recursos Adicionales

- [VS Code Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)

## 🎉 Después de Publicar

### Compartir
```markdown
🚀 ¡Nueva extensión publicada!

Comment → Issue - Convierte comentarios de código en issues de GitHub automáticamente

🔗 https://marketplace.visualstudio.com/items?itemName=TU-PUBLISHER.comment-to-issue

✨ Features:
- Detección automática de comentarios
- Creación de issues con un click
- Metadata como labels
- Vista lateral integrada

#VSCode #GitHub #Productivity
```

### Siguiente Versión
1. Recoger feedback
2. Planificar features v1.1.0
3. Crear issues en GitHub
4. Desarrollar y iterar

---

**¡Buena suerte con la publicación!** 🚀

Si tienes dudas, consulta la [documentación oficial](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
