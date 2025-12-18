/**
 * Tests for documentation resources
 */

import { describe, it, expect } from 'vitest';
import {
  documentationResources,
  getDocumentationResource
} from '../../src/resources/documentation.js';

describe('Documentation Resources', () => {
  describe('Resource definitions', () => {
    it('should define all documentation resources', () => {
      expect(documentationResources.length).toBeGreaterThan(0);

      documentationResources.forEach(resource => {
        expect(resource.uri).toBeDefined();
        expect(resource.name).toBeDefined();
        expect(resource.description).toBeDefined();
        expect(resource.mimeType).toBe('text/markdown');
      });
    });

    it('should include critical project structure resource', () => {
      const projectStructure = documentationResources.find(
        r => r.uri === 'atk://docs/project-structure'
      );

      expect(projectStructure).toBeDefined();
      expect(projectStructure?.description).toContain('CRITICAL');
      expect(projectStructure?.description).toContain('auto-generated');
    });

    it('should include commands reference', () => {
      const commands = documentationResources.find(
        r => r.uri === 'atk://docs/commands'
      );

      expect(commands).toBeDefined();
    });
  });

  describe('Resource content', () => {
    it('should return content for valid URI', () => {
      const content = getDocumentationResource('atk://docs/commands');

      expect(content).toBeDefined();
      expect(content?.uri).toBe('atk://docs/commands');
      expect(content?.mimeType).toBe('text/markdown');
      expect(content?.text).toBeDefined();
      expect(content?.text.length).toBeGreaterThan(0);
    });

    it('should return null for invalid URI', () => {
      const content = getDocumentationResource('atk://invalid/uri');

      expect(content).toBeNull();
    });

    it('should include ATK commands in commands reference', () => {
      const content = getDocumentationResource('atk://docs/commands');

      expect(content?.text).toContain('atk new');
      expect(content?.text).toContain('atk provision');
      expect(content?.text).toContain('atk deploy');
    });

    it('should include TypeSpec information', () => {
      const content = getDocumentationResource('atk://docs/commands');

      expect(content?.text).toContain('TypeSpec');
      expect(content?.text).toContain('type-spec');
    });

    it('should warn about generated files in project structure', () => {
      const content = getDocumentationResource('atk://docs/project-structure');

      expect(content?.text).toContain('manifest.json');
      expect(content?.text).toContain('declarativeAgent.json');
      expect(content?.text).toContain('.generated');
      expect(content?.text).toContain('AUTO-GENERATED');
    });
  });

  describe('URI format', () => {
    it('should use atk:// protocol', () => {
      documentationResources.forEach(resource => {
        expect(resource.uri).toMatch(/^atk:\/\//);
      });
    });

    it('should have unique URIs', () => {
      const uris = documentationResources.map(r => r.uri);
      const uniqueUris = new Set(uris);

      expect(uniqueUris.size).toBe(uris.length);
    });
  });
});
