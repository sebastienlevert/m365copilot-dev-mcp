/**
 * MCP Server setup and configuration
 * Initializes MCP server with stdio transport and registers handlers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { listTools, callTool } from './tools/index.js';
import { listPrompts, getPrompt } from './prompts/index.js';
import { listResources, getResource } from './resources/index.js';
import { info, error as logError } from './utils/logger.js';

/**
 * Create and configure MCP server
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: '@microsoft/m365copilot-dev-mcp',
      version: '0.1.0'
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {}
      }
    }
  );

  // Register tool handlers
  registerToolHandlers(server);

  // Register prompt handlers
  registerPromptHandlers(server);

  // Register resource handlers
  registerResourceHandlers(server);

  return server;
}

/**
 * Register tool request handlers
 */
function registerToolHandlers(server: Server): void {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    info('Handling ListTools request');
    const tools = listTools();
    return { tools };
  });

  // Execute a tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    info(`Handling CallTool request for: ${name}`, { args });

    try {
      // Create progress callback that sends logging messages
      const progressCallback = (message: string, level: 'info' | 'error' = 'info') => {
        server.sendLoggingMessage({
          level: level === 'error' ? 'error' : 'info',
          data: message,
          logger: name
        });
      };

      const result = await callTool(name, args || {}, progressCallback);
      // Return the result in the expected format
      return {
        content: result.content,
        isError: result.isError
      };
    } catch (err) {
      const error = err as Error;
      logError(`Tool execution failed: ${name}`, {
        error: error.message,
        stack: error.stack
      });

      return {
        content: [{
          type: 'text',
          text: `Error executing tool: ${error.message}`
        }],
        isError: true
      };
    }
  });

  info('Tool handlers registered');
}

/**
 * Register prompt request handlers
 */
function registerPromptHandlers(server: Server): void {
  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    info('Handling ListPrompts request');
    const prompts = listPrompts();
    return { prompts };
  });

  // Get prompt template
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    info(`Handling GetPrompt request for: ${name}`, { args });

    try {
      const messages = getPrompt(name, args || {});

      if (!messages) {
        logError(`Prompt not found: ${name}`);
        return {
          messages: [{
            role: 'assistant',
            content: {
              type: 'text',
              text: `Prompt '${name}' not found. Available prompts: ${listPrompts().map(p => p.name).join(', ')}`
            }
          }]
        };
      }

      return { messages };
    } catch (err) {
      const error = err as Error;
      logError(`Prompt generation failed: ${name}`, {
        error: error.message,
        stack: error.stack
      });

      return {
        messages: [{
          role: 'assistant',
          content: {
            type: 'text',
            text: `Error generating prompt: ${error.message}`
          }
        }]
      };
    }
  });

  info('Prompt handlers registered');
}

/**
 * Register resource request handlers
 */
function registerResourceHandlers(server: Server): void {
  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    info('Handling ListResources request');
    const resources = listResources();
    return { resources };
  });

  // Read resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    info(`Handling ReadResource request for: ${uri}`);

    try {
      const resource = getResource(uri);

      if (!resource) {
        logError(`Resource not found: ${uri}`);
        return {
          contents: [{
            uri,
            mimeType: 'text/plain',
            text: `Resource '${uri}' not found. Available resources can be listed with the list_resources request.`
          }]
        };
      }

      return {
        contents: [resource]
      };
    } catch (err) {
      const error = err as Error;
      logError(`Resource read failed: ${uri}`, {
        error: error.message,
        stack: error.stack
      });

      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: `Error reading resource: ${error.message}`
        }]
      };
    }
  });

  info('Resource handlers registered');
}

/**
 * Start the MCP server
 */
export async function startServer(): Promise<void> {
  info('Starting Microsoft 365 Copilot Developer MCP server');

  try {
    const server = createServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);

    info('M365 Copilot Developer MCP server started successfully');
    info('Server details', {
      name: '@microsoft/m365copilot-dev-mcp',
      version: '0.1.0',
      tools: listTools().length,
      prompts: listPrompts().length,
      resources: listResources().length
    });

  } catch (err) {
    const error = err as Error;
    logError('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
