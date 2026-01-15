import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await user.validatePassword(pass)) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    await this.usersService.updateRefreshToken(user.id, this.jwtService.sign(payload, { expiresIn: '7d' }));

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }

  async register(name: string, email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email ya registrado');
    }

    const newUser = await this.usersService.create({
      name,
      email,
      password,
    });

    const payload = { email: newUser.email, sub: newUser.id, role: newUser.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: newUser.id,
        role: newUser.role,
      },
    };
  }

  async refresh(refreshToken: string) {
  try {
    const decoded = this.jwtService.verify(refreshToken);
    
    const user = await this.usersService.findOne(decoded.sub);

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  } catch (error) {
    throw new UnauthorizedException('Refresh token inválido');
  }
}
}