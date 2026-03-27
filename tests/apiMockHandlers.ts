/**
 * Re-export of MSW handlers for use in test files.
 * Import this module to get the full set of mock API handlers:
 *
 *   import { handlers } from './apiMockHandlers.js'
 *
 * The handlers mock:
 *   GET /data/2.5/weather  — returns London fixture; 404 for q=UNKNOWN; 500 for q=ERROR; 401 for q=badkey
 *   GET /data/2.5/forecast — same routing logic
 */
export { handlers } from '../src/mocks/handlers';
