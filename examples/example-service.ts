/**
 * Archivo de ejemplo para probar Comment → Issue
 * 
 * Este archivo contiene varios comentarios de error de ejemplo
 * que serán detectados por la extensión.
 */

export class UserService {
  
  // ERROR: Validar que el email no esté duplicado en la base de datos [sev:alta; area:auth]
  async createUser(email: string, password: string) {
    // Implementación pendiente
    console.log('Creating user:', email);
  }

  // ERROR: Implementar recuperación de contraseña [sev:media; area:auth]
  async resetPassword(email: string) {
    throw new Error('Not implemented');
  }

  // ERROR: Agregar rate limiting para prevenir ataques de fuerza bruta [sev:alta; area:security]
  async login(email: string, password: string) {
    // Login básico sin protección
    return { token: 'fake-token' };
  }
}

export class ProductService {
  
  // ERROR: Optimizar consulta de productos con paginación [sev:media; area:performance]
  async getAllProducts() {
    // Esta consulta trae todos los productos sin límite
    return [];
  }

  // ERROR: Validar stock antes de permitir la compra [sev:alta; area:inventory]
  async purchaseProduct(productId: string, quantity: number) {
    console.log('Purchasing:', productId, quantity);
  }

  // ERROR: Implementar caché para productos más vendidos [sev:baja; area:performance]
  async getTopProducts() {
    return [];
  }
}

// ERROR: Agregar manejo de errores global [sev:alta; area:error-handling]
export function setupErrorHandling() {
  // TODO: Implementar
}

// ERROR: Documentar API con Swagger/OpenAPI [sev:baja; area:documentation]
export function setupDocs() {
  // Pendiente
}
