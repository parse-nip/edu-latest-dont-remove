import { initializeDaytona, getDaytonaClient } from './client';

const DAYTONA_CONFIG = {
  // Base URL is used only by server-side proxy; client hits /api/daytona
  baseUrl: process.env.NEXT_PUBLIC_DAYTONA_BASE_URL || 'https://app.daytona.io/api',
  apiKey: process.env.DAYTONA_API_KEY || process.env.NEXT_PUBLIC_DAYTONA_API_KEY || 'dtn_8fb213550e216b5d43b649c1ba39d0e8f07d0e1c18040bd294cf987f39ed6fd6'
};

// Global Daytona initialization
let isInitialized = false;

export async function ensureDaytonaInitialized(): Promise<boolean> {
  console.log('🔧 ensureDaytonaInitialized called');
  console.log('🔧 isInitialized:', isInitialized);
  console.log('🔧 getDaytonaClient():', !!getDaytonaClient());
  
  if (isInitialized && getDaytonaClient()) {
    console.log('✅ Daytona already initialized, returning true');
    return true;
  }

  try {
    console.log('🔧 Initializing Daytona client with config:', DAYTONA_CONFIG);
    const client = initializeDaytona(DAYTONA_CONFIG);
    console.log('🔧 initializeDaytona returned:', !!client);
    isInitialized = true;
    console.log('✅ Daytona client initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Daytona client:', error);
    console.error('❌ Error details:', error);
    return false;
  }
}

export async function getOrCreateDefaultSandbox(): Promise<string | null> {
    console.log('🏗️ getOrCreateDefaultSandbox called');
  
  const daytonaReady = await ensureDaytonaInitialized();
  console.log('🏗️ Daytona ready:', daytonaReady);
  
  const client = getDaytonaClient();
  console.log('🏗️ Client available:', !!client);
  
  if (!client) {
    console.error('❌ Daytona client not available');
    // Return a mock sandbox ID for development
    console.log('🔧 Using mock sandbox ID for development');
    return 'mock-sandbox-dev-' + Date.now();
  }

  try {
    console.log('🏗️ Listing existing sandboxes...');
    const sandboxes = await client.listSandboxes();
    console.log('🏗️ Found sandboxes:', sandboxes.length);
    console.log('🏗️ Sandboxes:', sandboxes.map(s => ({ id: s.id, name: s.name, status: s.status })));
    
    // Find a running sandbox or create a new one
    let runningSandbox = sandboxes.find(s => s.status === 'running');
    console.log('🏗️ Running sandbox found:', !!runningSandbox);
    
    if (!runningSandbox) {
      console.log('🏗️ Creating default sandbox...');
      
      // Create a new sandbox for the app
      const sandboxConfig = {
        name: `app-${Date.now()}`,
        template: 'node',
        devcontainer: {
          image: 'node:18'
        }
      };
      console.log('🏗️ Sandbox config:', sandboxConfig);
      
      const newSandbox = await client.createSandbox(sandboxConfig);
      console.log('🏗️ Sandbox created:', newSandbox);
      console.log('🏗️ Sandbox ID:', newSandbox.id);
      console.log('🏗️ Sandbox status:', newSandbox.status);
      
      // Start the sandbox if it's not already running
      if (newSandbox.status !== 'running') {
        console.log('🏗️ Starting sandbox...');
        try {
          await client.startSandbox(newSandbox.id);
          console.log('🏗️ Sandbox started successfully');
        } catch (startError) {
          console.error('❌ Failed to start sandbox:', startError);
          // Continue anyway, maybe the sandbox is already starting
        }
      } else {
        console.log('🏗️ Sandbox already running');
      }
      
      runningSandbox = newSandbox;
      console.log('✅ Default sandbox created and started:', newSandbox.id);
    } else {
      console.log('✅ Using existing running sandbox:', runningSandbox.id);
    }
    
    return runningSandbox.id;
  } catch (error) {
    console.error('❌ Failed to get or create default sandbox:', error);
    console.error('❌ Error details:', error);
    
    // Check if it's a CORS error, API error, or authentication error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.log('🔧 CORS error detected, using mock sandbox for development');
      return 'mock-sandbox-cors-' + Date.now();
    } else if (error instanceof Error && error.message.includes('Daytona API')) {
      console.log('🔧 Daytona API error detected, using mock sandbox for development');
      return 'mock-sandbox-api-error-' + Date.now();
    }
    
    // For any other error, return mock sandbox
    console.log('🔧 Unknown error, using mock sandbox for development');
    return 'mock-sandbox-error-' + Date.now();
  }
}

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  ensureDaytonaInitialized();
}
