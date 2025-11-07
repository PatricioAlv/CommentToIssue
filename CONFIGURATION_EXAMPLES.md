# Ejemplos de Configuración

## settings.json - Configuración Básica

```json
{
  "commentToIssue.provider": "github",
  "commentToIssue.github.owner": "miusuario",
  "commentToIssue.github.repo": "mi-proyecto",
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

## Patrones Personalizados

### Patrón por defecto (// ERROR:)
```json
{
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

**Detecta:**
```typescript
// ERROR: Mensaje aquí [sev:alta]
```

### Patrón para TODO con metadata
```json
{
  "commentToIssue.pattern": "//\\s*TODO:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

**Detecta:**
```typescript
// TODO: Implementar feature X [sprint:3; assignee:juan]
```

### Patrón para FIXME
```json
{
  "commentToIssue.pattern": "//\\s*FIXME:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

**Detecta:**
```typescript
// FIXME: Bug en validación [urgente:true]
```

### Patrón para BUG
```json
{
  "commentToIssue.pattern": "//\\s*BUG:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

**Detecta:**
```typescript
// BUG: Error al cargar datos [impact:alto]
```

### Patrón para múltiples keywords
```json
{
  "commentToIssue.pattern": "//\\s*(ERROR|TODO|FIXME|BUG):\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

**Detecta:**
```typescript
// ERROR: Mensaje [meta:data]
// TODO: Mensaje [meta:data]
// FIXME: Mensaje [meta:data]
// BUG: Mensaje [meta:data]
```

## Ejemplos de Metadata

### Severidad y área
```typescript
// ERROR: Problema de autenticación [sev:crítica; area:auth]
```
**Labels generados**: `sev:crítica`, `area:auth`

### Con asignación y milestone
```typescript
// ERROR: Implementar feature [assignee:maria; milestone:v2.0; priority:alta]
```
**Labels generados**: `assignee:maria`, `milestone:v2.0`, `priority:alta`

### Con tipo de issue
```typescript
// ERROR: Optimizar consulta [type:enhancement; effort:medium; area:database]
```
**Labels generados**: `type:enhancement`, `effort:medium`, `area:database`

### Con sprint y estimación
```typescript
// ERROR: Diseñar UI [sprint:5; story-points:8; team:frontend]
```
**Labels generados**: `sprint:5`, `story-points:8`, `team:frontend`

## Workspace Settings vs User Settings

### User Settings (global)
Archivo: `%APPDATA%\Code\User\settings.json`
```json
{
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

### Workspace Settings (por proyecto)
Archivo: `.vscode/settings.json`
```json
{
  "commentToIssue.github.owner": "mi-org",
  "commentToIssue.github.repo": "proyecto-especifico",
  "commentToIssue.pattern": "//\\s*ISSUE:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

## Configuración por Lenguaje

### TypeScript/JavaScript
```typescript
// ERROR: Validar tipos [sev:media; lang:typescript]
```

### Python
```python
# ERROR: Agregar type hints [sev:baja; lang:python]
```
**Nota**: Necesitas modificar el patrón para Python:
```json
{
  "commentToIssue.pattern": "#\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

### Java
```java
// ERROR: Refactorizar método [sev:media; lang:java]
```

### C#
```csharp
// ERROR: Implementar interfaz [sev:alta; lang:csharp]
```

## Convenciones de Metadata Recomendadas

### Severidad (sev)
```
sev:crítica   - Bloqueante, requiere atención inmediata
sev:alta      - Importante, debe resolverse pronto
sev:media     - Relevante, planificar en próximo sprint
sev:baja      - Mejora menor, puede esperar
```

### Área (area)
```
area:auth         - Autenticación/Autorización
area:ui           - Interfaz de usuario
area:api          - API/Backend
area:db           - Base de datos
area:performance  - Rendimiento
area:security     - Seguridad
area:docs         - Documentación
```

### Tipo (type)
```
type:bug          - Error/Bug
type:feature      - Nueva funcionalidad
type:enhancement  - Mejora
type:refactor     - Refactorización
type:docs         - Documentación
type:test         - Tests
```

### Esfuerzo (effort)
```
effort:small   - < 4 horas
effort:medium  - 1-2 días
effort:large   - 3-5 días
effort:xlarge  - > 1 semana
```

## Configuración Avanzada con Múltiples Repos

### Proyecto 1 - Frontend
`.vscode/settings.json`:
```json
{
  "commentToIssue.github.owner": "mi-org",
  "commentToIssue.github.repo": "frontend-app",
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

### Proyecto 2 - Backend
`.vscode/settings.json`:
```json
{
  "commentToIssue.github.owner": "mi-org",
  "commentToIssue.github.repo": "backend-api",
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

## Ejemplos de Comentarios Completos

### Ejemplo 1: Bug crítico
```typescript
// ERROR: Usuario no puede iniciar sesión después de cambio de contraseña [sev:crítica; area:auth; type:bug]
function handleLogin(username: string, password: string) {
  // implementación
}
```

### Ejemplo 2: Feature planificada
```typescript
// ERROR: Implementar filtros avanzados de búsqueda [sev:media; area:ui; type:feature; milestone:v2.1]
function searchProducts(query: string) {
  // implementación básica
}
```

### Ejemplo 3: Mejora de rendimiento
```typescript
// ERROR: Cachear resultados de API para reducir llamadas [sev:media; area:performance; type:enhancement; effort:medium]
async function fetchUserData(userId: string) {
  // llamada sin cache
}
```

### Ejemplo 4: Deuda técnica
```typescript
// ERROR: Refactorizar usando async/await en lugar de callbacks [sev:baja; area:refactor; effort:large]
function processData(callback) {
  // código legacy
}
```

### Ejemplo 5: Test faltante
```typescript
// ERROR: Agregar tests unitarios para validación de email [sev:media; area:test; coverage:low]
function validateEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}
```

## Tips de Configuración

### 1. Consistencia en el equipo
Crear archivo `.vscode/settings.json` compartido en el repo:
```json
{
  "commentToIssue.github.owner": "equipo-org",
  "commentToIssue.github.repo": "proyecto-compartido",
  "commentToIssue.pattern": "//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$"
}
```

### 2. Documentar convenciones
Crear `CONTRIBUTING.md`:
```markdown
## Comentarios de Error

Usa este formato:
// ERROR: descripción [sev:nivel; area:categoría]

Niveles de severidad: crítica, alta, media, baja
Áreas válidas: auth, ui, api, db, security
```

### 3. Automatización con Git Hooks
Crear `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Recordar escanear comentarios antes de commit
echo "No olvides ejecutar 'Scan: Buscar comentarios de error'"
```

### 4. Integración con CI/CD
GitHub Actions workflow:
```yaml
name: Check Error Comments
on: [push]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Search for ERROR comments
        run: |
          if grep -r "// ERROR:" --exclude-dir=node_modules .; then
            echo "Found ERROR comments - consider creating issues"
          fi
```

---

**Recuerda**: Puedes cambiar la configuración en cualquier momento desde VS Code Settings (`Ctrl+,`).
