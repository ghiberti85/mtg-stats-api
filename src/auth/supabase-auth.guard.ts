import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { supabase } from '../supabaseClient';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; [key: string]: any };
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader: string = request.headers['authorization'] as string;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    // ✅ Corrigido para `supabase.auth.getUser(token)` sem `.api`
    const { data, error }: { data: { user: any } | null; error: any } =
      await supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = data.user as {
      id: string;
      email: string;
      [key: string]: any;
    };
    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = data.user as {
      id: string;
      email: string;
      [key: string]: any;
    };
    return true;
  }
}
