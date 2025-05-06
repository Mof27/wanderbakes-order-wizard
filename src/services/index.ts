
// Re-export repositories from mock service for now
// Later we can swap this for real API implementation

import { mockDataService } from "./mock";

// Create a type for our data service that includes the setMode method
type DataService = typeof mockDataService;

export const dataService: DataService = mockDataService;
