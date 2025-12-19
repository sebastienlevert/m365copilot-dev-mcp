/**
 * Microsoft Docs Cache
 * Dynamically loads and caches official Microsoft documentation for agents from GitHub
 * Uses disk-based caching to avoid API throttling and share cache across server instances
 */

import { error as logError, info as logInfo } from './logger.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const GITHUB_REPO = 'MicrosoftDocs/m365copilot-docs';
const GITHUB_BRANCH = 'main';
const DOCS_PATH = 'docs';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DOCS_PATH}`;
const RAW_CONTENT_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}/${DOCS_PATH}`;

// Disk cache configuration
const CACHE_DIR = join(homedir(), '.cache', 'm365copilot-dev-mcp', 'docs');
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const METADATA_FILE = 'metadata.json';

export type ProjectType = 'typespec' | 'json';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
}

interface DocMetadata {
  filename: string;
  title: string;
  url: string;
  type: 'typespec' | 'json' | 'other';
}

// In-memory cache (for current session)
const docCache = new Map<string, string>();
const loadPromises = new Map<string, Promise<string>>();
let docsMetadata: DocMetadata[] | null = null;
let metadataLoadPromise: Promise<DocMetadata[]> | null = null;

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
      logInfo(`Created cache directory: ${CACHE_DIR}`);
    }
  } catch (error) {
    logError('Failed to create cache directory', { dir: CACHE_DIR, error });
  }
}

/**
 * Get cache file path for a filename
 */
function getCacheFilePath(filename: string): string {
  return join(CACHE_DIR, filename);
}

/**
 * Check if cached file is still valid
 */
function isCacheValid(filepath: string): boolean {
  try {
    if (!existsSync(filepath)) {
      return false;
    }

    const stats = statSync(filepath);
    const age = Date.now() - stats.mtimeMs;
    return age < CACHE_EXPIRY_MS;
  } catch (error) {
    logError('Failed to check cache validity', { filepath, error });
    return false;
  }
}

/**
 * Read from disk cache
 */
function readFromCache(filename: string): string | null {
  try {
    const filepath = getCacheFilePath(filename);

    if (!isCacheValid(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, 'utf-8');
    logInfo(`Loaded ${filename} from disk cache`);
    return content;
  } catch (error) {
    logError(`Failed to read ${filename} from cache`, { error });
    return null;
  }
}

/**
 * Write to disk cache
 */
function writeToCache(filename: string, content: string): void {
  try {
    ensureCacheDir();
    const filepath = getCacheFilePath(filename);
    writeFileSync(filepath, content, 'utf-8');
    logInfo(`Saved ${filename} to disk cache`);
  } catch (error) {
    logError(`Failed to write ${filename} to cache`, { error });
  }
}

/**
 * Read metadata from disk cache
 */
function readMetadataFromCache(): DocMetadata[] | null {
  try {
    const filepath = join(CACHE_DIR, METADATA_FILE);

    if (!isCacheValid(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, 'utf-8');
    const metadata = JSON.parse(content) as DocMetadata[];
    logInfo('Loaded metadata from disk cache');
    return metadata;
  } catch (error) {
    logError('Failed to read metadata from cache', { error });
    return null;
  }
}

/**
 * Write metadata to disk cache
 */
function writeMetadataToCache(metadata: DocMetadata[]): void {
  try {
    ensureCacheDir();
    const filepath = join(CACHE_DIR, METADATA_FILE);
    writeFileSync(filepath, JSON.stringify(metadata, null, 2), 'utf-8');
    logInfo('Saved metadata to disk cache');
  } catch (error) {
    logError('Failed to write metadata to cache', { error });
  }
}

/**
 * Determine doc type from filename
 */
function getDocType(filename: string): 'typespec' | 'json' | 'other' {
  const lower = filename.toLowerCase();

  // TypeSpec-related docs
  if (lower.includes('typespec') ||
      lower.includes('capabilities') ||
      lower.includes('decorators') ||
      lower.includes('authentication') ||
      lower.includes('scenarios')) {
    return 'typespec';
  }

  // JSON manifest-related docs
  if (lower.includes('manifest') ||
      lower.includes('plugin') ||
      lower.includes('declarative-agent')) {
    return 'json';
  }

  return 'other';
}

/**
 * Generate a clean title from filename
 */
function generateTitle(filename: string): string {
  return filename
    .replace('.md', '')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Fetch list of documentation files from GitHub API
 */
async function fetchDocsMetadata(): Promise<DocMetadata[]> {
  // Try disk cache first
  const cachedMetadata = readMetadataFromCache();
  if (cachedMetadata) {
    logInfo('Using cached metadata from disk');
    return cachedMetadata;
  }

  try {
    logInfo('Fetching documentation file list from GitHub API...');
    const response = await fetch(GITHUB_API_BASE, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'M365-Copilot-Dev-MCP'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const files = await response.json() as GitHubFile[];

    // Filter for markdown files only
    const mdFiles = files.filter(file =>
      file.type === 'file' && file.name.endsWith('.md')
    );

    const metadata: DocMetadata[] = mdFiles.map(file => ({
      filename: file.name,
      title: generateTitle(file.name),
      url: `${RAW_CONTENT_BASE}/${file.name}`,
      type: getDocType(file.name)
    }));

    logInfo(`Found ${metadata.length} documentation files`);

    // Save to disk cache
    writeMetadataToCache(metadata);

    return metadata;
  } catch (err) {
    const error = err as Error;
    logError('Failed to fetch documentation metadata', {
      url: GITHUB_API_BASE,
      error: error.message
    });
    throw new Error(`Failed to load documentation list: ${error.message}`);
  }
}

/**
 * Get documentation metadata (cached)
 */
async function getDocsMetadata(): Promise<DocMetadata[]> {
  if (docsMetadata) {
    return docsMetadata;
  }

  if (metadataLoadPromise) {
    return metadataLoadPromise;
  }

  metadataLoadPromise = fetchDocsMetadata();

  try {
    docsMetadata = await metadataLoadPromise;
    return docsMetadata;
  } catch (error) {
    metadataLoadPromise = null;
    throw error;
  }
}

/**
 * Fetch documentation content from URL
 */
async function fetchDocContent(filename: string, url: string): Promise<string> {
  // Try disk cache first
  const cachedContent = readFromCache(filename);
  if (cachedContent) {
    return cachedContent;
  }

  try {
    logInfo(`Fetching ${filename} from Microsoft Docs...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    logInfo(`Successfully loaded ${filename}`);

    // Save to disk cache
    writeToCache(filename, content);

    return content;
  } catch (err) {
    const error = err as Error;
    logError(`Failed to fetch ${filename}`, {
      url,
      error: error.message
    });
    throw new Error(`Failed to load ${filename}: ${error.message}`);
  }
}

/**
 * Get documentation content by filename (cached)
 */
async function getDocContent(filename: string, url: string): Promise<string> {
  // Return cached if available
  if (docCache.has(filename)) {
    return docCache.get(filename)!;
  }

  // If already loading, wait for that promise
  if (loadPromises.has(filename)) {
    return loadPromises.get(filename)!;
  }

  // Start loading and cache the promise
  const loadPromise = fetchDocContent(filename, url);
  loadPromises.set(filename, loadPromise);

  try {
    const content = await loadPromise;
    docCache.set(filename, content);
    loadPromises.delete(filename);
    return content;
  } catch (error) {
    // Clear the promise so next call will retry
    loadPromises.delete(filename);
    throw error;
  }
}

/**
 * Get capability documentation (cached)
 * Finds and returns the first capabilities-related doc
 */
export async function getCapabilityDocs(): Promise<string> {
  const metadata = await getDocsMetadata();
  const capDoc = metadata.find(doc =>
    doc.filename.toLowerCase().includes('capabilities')
  );

  if (!capDoc) {
    throw new Error('Capabilities documentation not found');
  }

  return getDocContent(capDoc.filename, capDoc.url);
}

/**
 * Get authentication documentation (cached)
 */
export async function getAuthenticationDocs(): Promise<string> {
  const metadata = await getDocsMetadata();
  const authDoc = metadata.find(doc =>
    doc.filename.toLowerCase().includes('authentication')
  );

  if (!authDoc) {
    throw new Error('Authentication documentation not found');
  }

  return getDocContent(authDoc.filename, authDoc.url);
}

/**
 * Get decorators documentation (cached)
 */
export async function getDecoratorsDocs(): Promise<string> {
  const metadata = await getDocsMetadata();
  const decorDoc = metadata.find(doc =>
    doc.filename.toLowerCase().includes('decorators')
  );

  if (!decorDoc) {
    throw new Error('Decorators documentation not found');
  }

  return getDocContent(decorDoc.filename, decorDoc.url);
}

/**
 * Get scenarios documentation (cached)
 */
export async function getScenariosDocs(): Promise<string> {
  const metadata = await getDocsMetadata();
  const scenarioDoc = metadata.find(doc =>
    doc.filename.toLowerCase().includes('scenarios')
  );

  if (!scenarioDoc) {
    throw new Error('Scenarios documentation not found');
  }

  return getDocContent(scenarioDoc.filename, scenarioDoc.url);
}

/**
 * Get overview documentation (cached)
 */
export async function getOverviewDocs(): Promise<string> {
  const metadata = await getDocsMetadata();
  const overviewDoc = metadata.find(doc =>
    doc.filename.toLowerCase().includes('overview')
  );

  if (!overviewDoc) {
    throw new Error('Overview documentation not found');
  }

  return getDocContent(overviewDoc.filename, overviewDoc.url);
}

/**
 * Get all available documentation files
 */
export async function getAllAvailableDocs(): Promise<DocMetadata[]> {
  return getDocsMetadata();
}

/**
 * Check if filename should be included based on project type
 */
function shouldIncludeFile(filename: string, projectType: ProjectType): boolean {
  const lower = filename.toLowerCase();

  // Always exclude these
  const excludePatterns = ['copilot-studio', 'convert', 'knowledge-sources'];
  if (excludePatterns.some(pattern => lower.includes(pattern))) {
    return false;
  }

  // Always include these for both types
  const commonPatterns = [
    'declarative-agent',
    'debug',
    'localize',
    'faq',
    'publish',
    'plugin-manifest-2.4',
    'declarative-agent-manifest-1.6'
  ];
  if (commonPatterns.some(pattern => lower.includes(pattern))) {
    return true;
  }

  // TypeSpec-specific: include files with "typespec" in name
  if (projectType === 'typespec') {
    return lower.includes('typespec');
  }

  // JSON-specific: include api-plugin, openapi, mcp-plugin but NOT typespec
  if (projectType === 'json') {
    const jsonPatterns = ['api-plugin', 'openapi', 'mcp-plugin'];
    const hasJsonPattern = jsonPatterns.some(pattern => lower.includes(pattern));
    const hasTypeSpec = lower.includes('typespec');
    return hasJsonPattern && !hasTypeSpec;
  }

  return false;
}

/**
 * Get documentation filtered by project type
 * Downloads ALL docs for caching, returns only relevant ones
 */
export async function getDocsByProjectType(projectType: ProjectType): Promise<Map<string, string>> {
  const metadata = await getDocsMetadata();
  const docs = new Map<string, string>();

  // Download ALL docs for caching
  logInfo(`Downloading all ${metadata.length} documentation files...`);

  // Download all docs in parallel (raw.githubusercontent.com has no rate limits)
  await Promise.all(
    metadata.map(async (doc) => {
      try {
        const content = await getDocContent(doc.filename, doc.url);
        // Add to return map only if it matches filter criteria
        if (shouldIncludeFile(doc.filename, projectType)) {
          docs.set(doc.title, content);
        }
      } catch (error) {
        logError(`Failed to load ${doc.filename}`, { error });
      }
    })
  );

  logInfo(`Loaded ${docs.size} ${projectType} documentation files (${metadata.length} total cached)`);
  return docs;
}

/**
 * Get metadata for a specific project type
 */
export async function getDocMetadataForProject(projectType: ProjectType): Promise<DocMetadata[]> {
  const metadata = await getDocsMetadata();
  return metadata.filter(doc => doc.type === projectType);
}

/**
 * Get available doc types for a project type
 */
export async function getDocTypesForProject(projectType: ProjectType): Promise<string[]> {
  const metadata = await getDocMetadataForProject(projectType);
  return metadata.map(doc => doc.title);
}

/**
 * Extract section for a specific capability from documentation
 */
export function extractCapabilitySection(markdown: string, capability: string): string {
  const lines = markdown.split('\n');
  let capturing = false;
  let section: string[] = [];

  // Look for various heading patterns
  const headingPatterns = [
    `## ${capability}`,
    `### ${capability}`,
    `## ${capability} Capability`,
    `### ${capability} Capability`
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start capturing at the capability heading
    if (headingPatterns.some(pattern => line.includes(pattern))) {
      capturing = true;
      section.push(line);
      continue;
    }

    // Stop at the next heading of same or higher level
    if (capturing && (line.startsWith('## ') || line.startsWith('# '))) {
      if (!headingPatterns.some(pattern => line.includes(pattern))) {
        break;
      }
    }

    if (capturing) {
      section.push(line);
    }
  }

  return section.join('\n').trim();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  cacheDir: string;
  exists: boolean;
  fileCount: number;
  files: string[];
} {
  const stats = {
    cacheDir: CACHE_DIR,
    exists: existsSync(CACHE_DIR),
    fileCount: 0,
    files: [] as string[]
  };

  if (stats.exists) {
    try {
      const files = readdirSync(CACHE_DIR);
      stats.fileCount = files.length;
      stats.files = files;
    } catch (error) {
      logError('Failed to read cache directory', { error });
    }
  }

  return stats;
}

/**
 * Clear the cache (useful for testing or force refresh)
 * @param filename Optional - clear specific file, or all if not specified
 */
export function clearCache(filename?: string): void {
  if (filename) {
    // Clear in-memory cache
    docCache.delete(filename);
    loadPromises.delete(filename);

    // Clear disk cache
    try {
      const filepath = getCacheFilePath(filename);
      if (existsSync(filepath)) {
        unlinkSync(filepath);
        logInfo(`Deleted ${filename} from disk cache`);
      }
    } catch (error) {
      logError(`Failed to delete ${filename} from disk cache`, { error });
    }

    logInfo(`${filename} cache cleared`);
  } else {
    // Clear in-memory cache
    docCache.clear();
    loadPromises.clear();
    docsMetadata = null;
    metadataLoadPromise = null;

    // Clear disk cache
    try {
      if (existsSync(CACHE_DIR)) {
        const files = readdirSync(CACHE_DIR);
        for (const file of files) {
          unlinkSync(join(CACHE_DIR, file));
        }
        logInfo('Deleted all files from disk cache');
      }
    } catch (error) {
      logError('Failed to clear disk cache', { error });
    }

    logInfo('All documentation caches cleared');
  }
}
