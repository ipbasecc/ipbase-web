import { login as strapi_login } from 'src/api/strapi.js';
import { login as mmLogin } from 'src/api/mattermost.js';
import { i18n } from 'src/boot/i18n.js';

export const authService = {
  async login(credentials) {
    let strapiResult, mmResult;
    try {
      strapiResult = await strapi_login(credentials);
      mmResult = await mmLogin({
        login_id: credentials.identifier,
        password: credentials.password
      });
      if (strapiResult?.data && mmResult?.data) {
        return { strapiResult, mmResult };
      }
    } catch (error) {
      console.error(error);
    }
  }
};
