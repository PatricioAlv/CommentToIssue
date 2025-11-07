/**
 * Interfaz genérica para proveedores de issues
 * Permite extender la funcionalidad a otros sistemas (Jira, GitLab, etc.)
 */

import { ReportComment, IssueInfo } from '../model';

/**
 * Interfaz que deben implementar todos los proveedores de issues
 */
export interface IssueProvider {
  /**
   * Crea un issue en el sistema remoto
   * @param comment Comentario a convertir en issue
   * @returns Información del issue creado
   */
  createIssue(comment: ReportComment): Promise<IssueInfo>;
  
  /**
   * Obtiene la URL para abrir un archivo en el repositorio remoto
   * @param file Ruta del archivo
   * @param line Número de línea
   * @returns URL del archivo en el repositorio
   */
  getRemoteUrl(file: string, line: number): Promise<string>;
  
  /**
   * Obtiene el permalink permanente de un archivo
   * @param file Ruta del archivo
   * @param line Número de línea
   * @returns URL permanente (con commit hash)
   */
  getPermalink(file: string, line: number): Promise<string>;
  
  /**
   * Verifica si el proveedor está configurado correctamente
   * @returns true si está configurado, false en caso contrario
   */
  isConfigured(): Promise<boolean>;
}
