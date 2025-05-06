
// Re-export repositories from mock service for now
// Later we can swap this for real API implementation

import { mockDataService } from "./mock";

export const dataService = mockDataService;
