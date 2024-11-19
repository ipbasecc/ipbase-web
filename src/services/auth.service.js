import { login as strapi_login } from 'src/api/strapi.js';
import { login as mmLogin } from 'src/api/mattermost.js';

export const authService = {
  async login(credentials) {
    const strapiResult = await strapi_login(credentials);
    
    if (strapiResult?.data) {
      const mmResult = await mmLogin({
        login_id: credentials.identifier,
        password: credentials.password
      });
      
      return { strapiResult, mmResult };
    }
    
    throw new Error('Login failed');
  }
};