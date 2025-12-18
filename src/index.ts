#!/usr/bin/env node

/**
 * @microsoft/m365copilot-dev-mcp
 * MCP server for Microsoft 365 Copilot development
 *
 * This server provides comprehensive tooling for M365 Copilot development including:
 * - ATK CLI commands exposed as MCP tools
 * - Workflow prompts and best practices
 * - Documentation resources for building M365 Copilot extensions and agents
 * - Extensible architecture for future M365 Copilot dev capabilities
 */

import { startServer } from './server.js';

// Start the MCP server
startServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
