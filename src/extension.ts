/**
 * Punto de entrada de la extensión
 * Activa comandos, registra el TreeView y gestiona el ciclo de vida de la extensión
 */

import * as vscode from 'vscode';
import { CommentTreeProvider } from './tree';
import { scanWorkspace, saveComments, loadComments } from './parser';
import { GitHubProvider, configureGitHubToken } from './providers/github';
import { ReportComment } from './model';

// Variable global para compartir el contexto con el proveedor de GitHub
declare global {
  var commentToIssueContext: vscode.ExtensionContext;
}

/**
 * Se ejecuta cuando la extensión se activa
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Extensión "Comment → Issue" activada');
  
  // Guardar contexto globalmente para acceso desde providers
  (global as any).commentToIssueContext = context;
  
  // Inicializar el TreeView
  const treeProvider = new CommentTreeProvider();
  const treeView = vscode.window.createTreeView('errorsDetected', {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });
  
  // Inicializar el proveedor de GitHub
  const githubProvider = new GitHubProvider();
  
  // Cargar comentarios guardados al iniciar
  const savedComments = await loadComments();
  if (savedComments.length > 0) {
    treeProvider.setComments(savedComments);
  }
  
  // Comando: Escanear workspace
  const scanCommand = vscode.commands.registerCommand('commentToIssue.scan', async () => {
    try {
      vscode.window.showInformationMessage('Escaneando workspace...');
      
      const comments = await scanWorkspace();
      treeProvider.setComments(comments);
      await saveComments(comments);
      
      vscode.window.showInformationMessage(
        `Se encontraron ${comments.length} comentario(s) de error.`
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error al escanear: ${error.message}`);
    }
  });
  
  // Comando: Crear issue en GitHub
  const createIssueCommand = vscode.commands.registerCommand(
    'commentToIssue.createIssue',
    async (treeItem: any) => {
      const comment = treeItem.comment as ReportComment;
      
      if (!comment) {
        return;
      }
      
      // Verificar si ya tiene issue
      if (comment.issueNumber) {
        const response = await vscode.window.showWarningMessage(
          `Este comentario ya tiene asociado el issue #${comment.issueNumber}. ¿Deseas crear uno nuevo de todas formas?`,
          'Sí',
          'No'
        );
        
        if (response !== 'Sí') {
          return;
        }
      }
      
      try {
        // Verificar configuración
        const isConfigured = await githubProvider.isConfigured();
        if (!isConfigured) {
          const response = await vscode.window.showErrorMessage(
            'GitHub no está configurado. ¿Deseas configurar el token ahora?',
            'Configurar',
            'Cancelar'
          );
          
          if (response === 'Configurar') {
            await configureGitHubToken(context);
            return;
          }
          return;
        }
        
        // Crear el issue
        vscode.window.showInformationMessage('Creando issue en GitHub...');
        const issueInfo = await githubProvider.createIssue(comment);
        
        // Actualizar el comentario en el archivo con el número de issue
        await insertIssueNumberInFile(comment, issueInfo.number);
        
        // Actualizar el TreeView
        treeProvider.updateComment(comment.file, comment.line, issueInfo.number);
        
        // Guardar los cambios
        const currentComments = await loadComments();
        const updatedComments = currentComments.map(c => 
          c.file === comment.file && c.line === comment.line 
            ? { ...c, issueNumber: issueInfo.number }
            : c
        );
        await saveComments(updatedComments);
        
        // Mostrar mensaje de éxito
        const action = await vscode.window.showInformationMessage(
          `✅ Issue #${issueInfo.number} creado exitosamente`,
          'Ver en GitHub'
        );
        
        if (action === 'Ver en GitHub') {
          vscode.env.openExternal(vscode.Uri.parse(issueInfo.htmlUrl));
        }
        
      } catch (error: any) {
        if (error.message.includes('autenticación')) {
          vscode.window.showErrorMessage(
            `❌ Error de autenticación: ${error.message}`,
            'Configurar token'
          ).then((response: string | undefined) => {
            if (response === 'Configurar token') {
              configureGitHubToken(context);
            }
          });
        } else {
          vscode.window.showErrorMessage(`❌ Error al crear issue: ${error.message}`);
        }
      }
    }
  );
  
  // Comando: Abrir en GitHub
  const openOnRemoteCommand = vscode.commands.registerCommand(
    'commentToIssue.openOnRemote',
    async (treeItem: any) => {
      const comment = treeItem.comment as ReportComment;
      
      if (!comment) {
        return;
      }
      
      try {
        const url = await githubProvider.getRemoteUrl(comment.file, comment.line);
        vscode.env.openExternal(vscode.Uri.parse(url));
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );
  
  // Comando: Copiar permalink
  const copyPermalinkCommand = vscode.commands.registerCommand(
    'commentToIssue.copyPermalink',
    async (treeItem: any) => {
      const comment = treeItem.comment as ReportComment;
      
      if (!comment) {
        return;
      }
      
      try {
        const permalink = await githubProvider.getPermalink(comment.file, comment.line);
        await vscode.env.clipboard.writeText(permalink);
        vscode.window.showInformationMessage('Permalink copiado al portapapeles');
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );
  
  // Comando: Refrescar vista
  const refreshCommand = vscode.commands.registerCommand('commentToIssue.refresh', () => {
    treeProvider.refresh();
  });
  
  // Comando: Ir a comentario (usado internamente)
  const goToCommentCommand = vscode.commands.registerCommand(
    'commentToIssue.goToComment',
    async (comment: ReportComment) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        return;
      }
      
      const filePath = vscode.Uri.joinPath(workspaceFolder.uri, comment.file);
      const document = await vscode.workspace.openTextDocument(filePath);
      const editor = await vscode.window.showTextDocument(document);
      
      // Posicionar el cursor en la línea del comentario
      const position = new vscode.Position(comment.line - 1, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    }
  );
  
  // Comando: Configurar token de GitHub
  const configureTokenCommand = vscode.commands.registerCommand(
    'commentToIssue.configureToken',
    () => configureGitHubToken(context)
  );
  
  // Registrar todos los comandos y providers
  context.subscriptions.push(
    treeView,
    scanCommand,
    createIssueCommand,
    openOnRemoteCommand,
    copyPermalinkCommand,
    refreshCommand,
    goToCommentCommand,
    configureTokenCommand
  );
  
  // Escaneo automático al activar (opcional)
  // await vscode.commands.executeCommand('commentToIssue.scan');
}

/**
 * Inserta el número de issue al final del comentario en el archivo
 */
async function insertIssueNumberInFile(comment: ReportComment, issueNumber: number): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }
  
  const filePath = vscode.Uri.joinPath(workspaceFolder.uri, comment.file);
  const document = await vscode.workspace.openTextDocument(filePath);
  
  // Crear una edición para insertar el número de issue
  const edit = new vscode.WorkspaceEdit();
  const line = document.lineAt(comment.line - 1);
  const lineText = line.text;
  
  // Verificar si ya tiene un marcador de issue
  if (!lineText.includes('[GH-#')) {
    const endPosition = line.range.end;
    edit.insert(filePath, endPosition, ` [GH-#${issueNumber}]`);
    await vscode.workspace.applyEdit(edit);
    await document.save();
  }
}

/**
 * Se ejecuta cuando la extensión se desactiva
 */
export function deactivate() {
  console.log('Extensión "Comment → Issue" desactivada');
}
