/**
 * Webpack entry point — dynamically imports the bootstrap file.
 *
 * This creates the async boundary needed for Module Federation.
 * See bootstrap.tsx for a detailed explanation of WHY this is necessary.
 */
import('./bootstrap');
