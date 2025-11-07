/**
 * Proveedor de GitHub
 * Implementa la integración con GitHub usando Octokit REST API
 */

import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';
import { IssueProvider } from './provider';
import { ReportComment, IssueInfo, GitHubConfig } from '../model';

/**
 * Implementación del proveedor de issues para GitHub
 */
export class GitHubProvider implements IssueProvider {
  private octokit: Octokit | null = null;
  private config: GitHubConfig | null = null;

  /**
   * Inicializa el proveedor con la configuración de GitHub
   */
  async initialize(): Promise<void> {
    const workspaceConfig = vscode.workspace.getConfiguration('commentToIssue');
    const owner = workspaceConfig.get<string>('github.owner');
    const repo = workspaceConfig.get<string>('github.repo');
    
    // Obtener el token del SecretStorage
    const context = (global as any).commentToIssueContext as vscode.ExtensionContext;
    const token = await context.secrets.get('github.token');
    
    if (!owner || !repo || !token) {
      this.octokit = null;
      this.config = null;
      return;
    }
    
    this.config = { owner, repo, token };
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Crea un issue en GitHub
   */
  async createIssue(comment: ReportComment): Promise<IssueInfo> {
    await this.initialize();
    
    if (!this.octokit || !this.config) {
      throw new Error('GitHub no está configurado. Por favor configura owner, repo y token.');
    }
    
    try {
      // Preparar labels desde metadata
      const labels: string[] = [];
      for (const [key, value] of Object.entries(comment.metadata)) {
        labels.push(`${key}:${value}`);
      }
      
      // Crear el body del issue con información del archivo
      const body = `**Archivo:** \`${comment.file}\`
**Línea:** ${comment.line}

**Comentario original:**
\`\`\`
${comment.text}
\`\`\`

**Descripción:**
${comment.message}

---
_Creado automáticamente por Comment → Issue_`;
      
      // Crear el issue
      const response = await this.octokit.rest.issues.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title: comment.message.substring(0, 100), // Limitar título
        body,
        labels
      });
      
      return {
        number: response.data.number,
        url: response.data.url,
        htmlUrl: response.data.html_url
      };
      
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Error de autenticación. Verifica tu token de GitHub.');
      }
      throw new Error(`Error al crear issue: ${error.message}`);
    }
  }

  /**
   * Obtiene la URL del archivo en GitHub
   */
  async getRemoteUrl(file: string, line: number): Promise<string> {
    await this.initialize();
    
    if (!this.config) {
      throw new Error('GitHub no está configurado.');
    }
    
    // Obtener la rama actual
    const branch = await this.getCurrentBranch();
    
    return `https://github.com/${this.config.owner}/${this.config.repo}/blob/${branch}/${file}#L${line}`;
  }

  /**
   * Obtiene el permalink permanente con commit hash
   */
  async getPermalink(file: string, line: number): Promise<string> {
    await this.initialize();
    
    if (!this.config) {
      throw new Error('GitHub no está configurado.');
    }
    
    // Obtener el commit hash actual
    const commitHash = await this.getCurrentCommitHash();
    
    return `https://github.com/${this.config.owner}/${this.config.repo}/blob/${commitHash}/${file}#L${line}`;
  }

  /**
   * Verifica si GitHub está configurado
   */
  async isConfigured(): Promise<boolean> {
    await this.initialize();
    return this.octokit !== null && this.config !== null;
  }

  /**
   * Obtiene la rama actual del repositorio
   */
  private async getCurrentBranch(): Promise<string> {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);
    
    if (git && git.repositories.length > 0) {
      const repo = git.repositories[0];
      return repo.state.HEAD?.name || 'main';
    }
    
    return 'main';
  }

  /**
   * Obtiene el hash del commit actual
   */
  private async getCurrentCommitHash(): Promise<string> {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);
    
    if (git && git.repositories.length > 0) {
      const repo = git.repositories[0];
      return repo.state.HEAD?.commit || 'main';
    }
    
    return 'main';
  }
}

/**
 * Configura el token de GitHub en SecretStorage
 */
export async function configureGitHubToken(context: vscode.ExtensionContext): Promise<void> {
  const token = await vscode.window.showInputBox({
    prompt: 'Ingresa tu Personal Access Token de GitHub',
    password: true,
    placeHolder: 'ghp_...',
    ignoreFocusOut: true
  });
  
  if (token) {
    await context.secrets.store('github.token', token);
    vscode.window.showInformationMessage('Token de GitHub guardado correctamente.');
  }
}
