/**
 * Modelo de datos principal
 * Define las interfaces y tipos utilizados en toda la extensión
 */

/**
 * Representa un comentario detectado en el código
 */
export interface ReportComment {
  /** Ruta del archivo donde se encuentra el comentario */
  file: string;
  /** Número de línea (1-indexed) */
  line: number;
  /** Texto completo del comentario */
  text: string;
  /** Mensaje del error extraído */
  message: string;
  /** Metadata extraída del comentario (sev, area, etc.) */
  metadata: Record<string, string>;
  /** Número de issue de GitHub si ya fue creado */
  issueNumber?: number;
}

/**
 * Configuración de GitHub
 */
export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
}

/**
 * Resultado del parsing de metadata
 * Ejemplo: [sev:alta; area:auth] -> { sev: 'alta', area: 'auth' }
 */
export interface ParsedMetadata {
  [key: string]: string;
}

/**
 * Información de un issue creado
 */
export interface IssueInfo {
  number: number;
  url: string;
  htmlUrl: string;
}
