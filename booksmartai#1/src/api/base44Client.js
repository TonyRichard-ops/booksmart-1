import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68827ad7cfe1bc153a3c240f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
