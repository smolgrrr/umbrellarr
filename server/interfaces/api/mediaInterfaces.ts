import type Media from '@server/entity/Media';
import type { PaginatedResponse } from './common';

export interface MediaResultsResponse extends PaginatedResponse {
  results: Media[];
}

export interface MediaWatchDataResponse {
  data?: {
    playCount: number;
    playCount7Days: number;
    playCount30Days: number;
  };
  data4k?: {
    playCount: number;
    playCount7Days: number;
    playCount30Days: number;
  };
}
