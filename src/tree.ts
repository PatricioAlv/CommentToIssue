/**
 * TreeView Provider
 * Gestiona la vista lateral "Errores detectados" que muestra los comentarios encontrados
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ReportComment } from './model';

/**
 * Elemento del árbol que puede ser un archivo o un comentario
 */
export class CommentTreeItem extends vscode.TreeItem {
  public contextValue?: string;
  
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly comment?: ReportComment,
    public readonly isFile: boolean = false
  ) {
    super(label, collapsibleState);
    
    if (comment) {
      // Es un comentario individual
      this.contextValue = 'comment';
      this.tooltip = comment.text;
      this.description = comment.issueNumber ? `[GH-#${comment.issueNumber}]` : '';
      
      // Comando al hacer clic: ir al archivo y línea
      this.command = {
        command: 'commentToIssue.goToComment',
        title: 'Ir a comentario',
        arguments: [comment]
      };
      
      // Icono según si tiene issue asignado
      this.iconPath = comment.issueNumber 
        ? new vscode.ThemeIcon('issues', new vscode.ThemeColor('charts.green'))
        : new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.yellow'));
        
    } else if (isFile) {
      // Es un archivo contenedor
      this.contextValue = 'file';
      this.iconPath = vscode.ThemeIcon.File;
    }
  }
}

/**
 * Proveedor del TreeView de comentarios
 */
export class CommentTreeProvider implements vscode.TreeDataProvider<CommentTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<CommentTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  private comments: ReportComment[] = [];

  /**
   * Actualiza los comentarios mostrados en el árbol
   */
  setComments(comments: ReportComment[]): void {
    this.comments = comments;
    this.refresh();
  }

  /**
   * Refresca la vista del árbol
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Obtiene un elemento del árbol
   */
  getTreeItem(element: CommentTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Obtiene los hijos de un elemento (o los elementos raíz si no se pasa elemento)
   */
  getChildren(element?: CommentTreeItem): Promise<CommentTreeItem[]> {
    if (!element) {
      // Nivel raíz: agrupar por archivo
      return Promise.resolve(this.getFileNodes());
    } else if (element.isFile) {
      // Nivel archivo: mostrar comentarios
      return Promise.resolve(this.getCommentNodes(element.label));
    }
    
    return Promise.resolve([]);
  }

  /**
   * Obtiene los nodos de archivos (agrupación)
   */
  private getFileNodes(): CommentTreeItem[] {
    // Agrupar comentarios por archivo
    const fileMap = new Map<string, ReportComment[]>();
    
    for (const comment of this.comments) {
      if (!fileMap.has(comment.file)) {
        fileMap.set(comment.file, []);
      }
      fileMap.get(comment.file)!.push(comment);
    }
    
    // Crear nodos de archivo
    const fileNodes: CommentTreeItem[] = [];
    
    for (const [file, comments] of fileMap.entries()) {
      const fileName = path.basename(file);
      const node = new CommentTreeItem(
        `${fileName} (${comments.length})`,
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        true
      );
      node.description = path.dirname(file);
      fileNodes.push(node);
    }
    
    return fileNodes.sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Obtiene los nodos de comentarios para un archivo específico
   */
  private getCommentNodes(fileLabel: string): CommentTreeItem[] {
    // Extraer el nombre del archivo del label (que tiene formato "file.ts (3)")
    const fileName = fileLabel.replace(/\s*\(\d+\)$/, '');
    
    const fileComments = this.comments.filter(c => 
      path.basename(c.file) === fileName
    );
    
    return fileComments.map(comment => {
      const label = `Línea ${comment.line}: ${comment.message.substring(0, 50)}`;
      return new CommentTreeItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        comment
      );
    });
  }

  /**
   * Actualiza un comentario específico (ej. después de crear issue)
   */
  updateComment(file: string, line: number, issueNumber: number): void {
    const comment = this.comments.find(c => c.file === file && c.line === line);
    if (comment) {
      comment.issueNumber = issueNumber;
      this.refresh();
    }
  }
}
