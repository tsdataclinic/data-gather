import { Configuration } from '@azure/msal-browser';

// configuration for Azure AD B2C
export interface AzureAuthConfig {
  api: {
    // scopes needed to access the app's API
    b2cScopes: string[];
  };
  client: Configuration;

  // scopes to be granted at login. Additional API-level scopes are included
  // in api.b2cScopes
  loginRequest: {
    scopes: string[];
  };
}
