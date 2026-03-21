import type { Request } from 'express';
import type { SessionResponse } from '@nexus/shared';

export interface AuthenticatedRequest extends Request {
  user: SessionResponse['user'];
  nexusSession: SessionResponse;
}
