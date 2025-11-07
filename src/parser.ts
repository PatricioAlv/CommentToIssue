/**
 * Parser de comentarios
 * Escanea los archivos del workspace y detecta comentarios que sigan el patrón configurado
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ReportComment } from './model';

/**
 * Escanea todos los archivos del workspace y detecta comentarios de error
 * @returns Array de comentarios detectados
 */
export async function scanWorkspace(): Promise<ReportComment[]> {
  const config = vscode.workspace.getConfiguration('commentToIssue');
  const pattern = config.get<string>('pattern') || '//\\s*ERROR:\\s*(.+?)(?:\\[(.+?)\\])?$';
  
  const comments: ReportComment[] = [];
  
  // Buscar todos los archivos (excluyendo node_modules, out, etc.)
  const files = await vscode.workspace.findFiles(
    '**/*.{ts,js,tsx,jsx,py,java,cs,cpp,c,go,rb,php}',
    '**/node_modules/**'
  );

  for (const fileUri of files) {
    const fileComments = await scanFile(fileUri, pattern);
    comments.push(...fileComments);
  }

  return comments;
}

/**
 * Escanea un archivo específico en busca de comentarios
 * @param fileUri URI del archivo a escanear
 * @param pattern Patrón regex para detectar comentarios
 * @returns Array de comentarios encontrados en el archivo
 */
async function scanFile(fileUri: vscode.Uri, pattern: string): Promise<ReportComment[]> {
  const comments: ReportComment[] = [];
  
  try {
    const document = await vscode.workspace.openTextDocument(fileUri);
    const text = document.getText();
    // Soportar CRLF y LF correctamente al dividir en líneas
    const lines = text.split(/\r?\n/);
    
    // Compilar el patrón regex
    const regex = new RegExp(pattern, 'gm');
    
    lines.forEach((line: string, index: number) => {
      // Limpiar posible '\r' residual y usar la línea limpia para el match
      const cleanLine = line.replace(/\r$/, '');
      const match = regex.exec(cleanLine);
      if (match) {
        const message = match[1]?.trim() || '';
        const metadataStr = match[2] || '';
        const metadata = parseMetadata(metadataStr);
        
        // Verificar si ya tiene número de issue asignado
        const issueMatch = cleanLine.match(/\[GH-#(\d+)\]/);
        const issueNumber = issueMatch ? parseInt(issueMatch[1], 10) : undefined;
        
        comments.push({
          file: vscode.workspace.asRelativePath(fileUri),
          line: index + 1,
          text: cleanLine.trim(),
          message,
          metadata,
          issueNumber
        });
      }
      
      // Resetear lastIndex para búsquedas correctas (evita efectos del flag 'g')
      regex.lastIndex = 0;
    });
    
  } catch (error) {
    console.error(`Error scanning file ${fileUri.fsPath}:`, error);
  }
  
  return comments;
}

/**
 * Parsea la metadata de un comentario
 * Ejemplo: "sev:alta; area:auth" -> { sev: 'alta', area: 'auth' }
 * @param metadataStr String con la metadata
 * @returns Objeto con pares clave-valor
 */
function parseMetadata(metadataStr: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  
  if (!metadataStr) {
    return metadata;
  }
  
  // Dividir por ; o ,
  const parts = metadataStr.split(/[;,]/).map(p => p.trim());
  
  for (const part of parts) {
    const [key, value] = part.split(':').map(s => s.trim());
    if (key && value) {
      metadata[key] = value;
    }
  }
  
  return metadata;
}

/**
 * Guarda los comentarios escaneados en un archivo local
 * @param comments Comentarios a guardar
 */
export async function saveComments(comments: ReportComment[]): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }
  
  const reportPath = path.join(workspaceFolder.uri.fsPath, '.comment-to-issue.json');
  const reportUri = vscode.Uri.file(reportPath);
  
  try {
    const content = JSON.stringify(comments, null, 2);
    await vscode.workspace.fs.writeFile(reportUri, Buffer.from(content, 'utf8'));
  } catch (error) {
    console.error('Error saving comments:', error);
  }
}

/**
 * Carga los comentarios guardados del archivo local
 * @returns Array de comentarios guardados
 */
export async function loadComments(): Promise<ReportComment[]> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return [];
  }
  
  const reportPath = path.join(workspaceFolder.uri.fsPath, '.comment-to-issue.json');
  const reportUri = vscode.Uri.file(reportPath);
  
  try {
    const content = await vscode.workspace.fs.readFile(reportUri);
    const text = Buffer.from(content).toString('utf8');
    return JSON.parse(text);
  } catch (error) {
    // El archivo no existe o no se puede leer
    return [];
  }
}
