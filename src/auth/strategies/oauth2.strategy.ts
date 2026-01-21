import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { UsersService } from '../../users/users.service';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(private usersService: UsersService) {
    super({
      authorizationURL: process.env.OAUTH2_AUTH_URL || 'https://example.com/oauth2/authorize',
      tokenURL: process.env.OAUTH2_TOKEN_URL || 'https://example.com/oauth2/token',
      clientID: process.env.OAUTH2_CLIENT_ID || 'client-id',
      clientSecret: process.env.OAUTH2_CLIENT_SECRET || 'client-secret',
      callbackURL: process.env.OAUTH2_CALLBACK_URL || 'http://localhost:3000/auth/oauth2/callback',
      scope: ['profile', 'email'],
    });
    
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    // Google envía el email en profile._json.email
    const email = profile._json?.email || profile.email;
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      // Crear usuario si no existe, dejando que la base de datos asigne el id (autoincremental)
      user = await this.usersService.create({
        email,
        name: profile.displayName || profile._json?.name || email,
        password: Math.random().toString(36).slice(-8), // Password random, no se usará
        role: 'socio',
      });
      
    }
    
    // Devolver el id real (user.id) como number para el JWT, usando sub para máxima compatibilidad
    done(null, { sub: Number(user.id), id: Number(user.id), email: user.email, role: user.role });
  }
}
