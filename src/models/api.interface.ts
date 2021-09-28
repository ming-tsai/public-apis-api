import { Auth } from './auth.enum';
import { Cors } from './cors.enum';

export interface API {
  id: string;
  name: string;
  url: string;
  description: string;
  auth: Auth;
  https: boolean;
  cors: Cors;
  updated_at: Date;
}
