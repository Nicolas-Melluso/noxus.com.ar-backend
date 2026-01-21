import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UsersService) {
    
    super({
      clientID: process.env.OAUTH2_CLIENT_ID,
      clientSecret: process.env.OAUTH2_CLIENT_SECRET,
      callbackURL: process.env.OAUTH2_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth2/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    if (!email) {
      return done(new Error('No se pudo obtener el email de Google'), false);
    }
    done(null, { email, name });
  }
}
