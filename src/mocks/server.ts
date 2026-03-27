import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW server used during Vitest runs (Node environment) */
export const server = setupServer(...handlers);
