/**
 * Docusaurus plugin that injects the glossary cross-reference remark plugin
 * into both the docs and pages content pipelines.
 *
 * This replaces the manual Python scripts (add_cross_links_in_term_definitions.py)
 * with a fully integrated, build-time solution that:
 *   - Never modifies source files
 *   - Automatically picks up new terms
 *   - Works with hot-reload in development mode
 */

import path from 'path';
import { remarkGlossaryLinks } from './remark-glossary-links.mjs';

export default function pluginGlossaryLinks(context /*, options */) {
  const termsDir = path.join(context.siteDir, 'docs', 'terms');

  // Pre-bind the plugin with the terms directory
  const boundPlugin = (options) => remarkGlossaryLinks({ ...options, termsDir });

  return {
    name: 'docusaurus-plugin-glossary-links',

    // Inject into the docs content plugin
    configureWebpack(_config, _isServer, _utils) {
      return {};
    },

    // This hook injects our remark plugin into docs processing
    async contentLoaded({ actions }) {
      // No-op – the remark plugin is injected via getDefaultRemarkPlugins below
    },

    // Provide the remark plugin to be used by @docusaurus/plugin-content-docs
    getDefaultRemarkPlugins() {
      return [[boundPlugin, {}]];
    },
  };
}
