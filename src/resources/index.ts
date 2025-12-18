/**
 * Resource registry and exports
 * Provides centralized resource management for MCP server
 */

import {
  documentationResources,
  getDocumentationResource,
  ResourceDefinition,
  ResourceContent
} from './documentation.js';

import {
  exampleResources,
  getExampleResource
} from './examples.js';

import { error as logError } from '../utils/logger.js';

/**
 * Get all resource definitions
 */
export function listResources(): ResourceDefinition[] {
  return [
    ...documentationResources,
    ...exampleResources
  ];
}

/**
 * Get resource content by URI
 * @param uri Resource URI
 */
export function getResource(uri: string): ResourceContent | null {
  // Try documentation resources first
  const docResource = getDocumentationResource(uri);
  if (docResource) {
    return docResource;
  }

  // Try example resources
  const exampleResource = getExampleResource(uri);
  if (exampleResource) {
    return exampleResource;
  }

  // Resource not found
  logError(`Resource not found: ${uri}`);
  return null;
}

/**
 * Get resource definition by URI
 */
export function getResourceDefinition(uri: string): ResourceDefinition | undefined {
  const allResources = listResources();
  return allResources.find(r => r.uri === uri);
}

/**
 * Check if resource exists
 */
export function hasResource(uri: string): boolean {
  return getResourceDefinition(uri) !== undefined;
}

// Re-export types
export type { ResourceDefinition, ResourceContent };
