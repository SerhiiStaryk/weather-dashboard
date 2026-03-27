import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** MSW service-worker for browser dev usage */
export const worker = setupWorker(...handlers);
