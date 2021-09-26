import { Auth } from './auth.enum';
import { Cors } from './cors.enum';

export interface API {
  id: string;
  name: string;
  url: string;
  description: string;
  auth: Auth;
  with_https: boolean;
  with_cors: Cors;
  updated_at: Date;
}
