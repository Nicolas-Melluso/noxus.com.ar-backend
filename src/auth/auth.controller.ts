import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    return this.authService.register(name, email, password);
  }

  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string
  ) {
    return await this.authService.refresh(refreshToken);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }

  // GoogleStrategy en /auth/oauth2 y /auth/oauth2/callback
  @Get('oauth2')
  @UseGuards(AuthGuard('google'))
  async oauth2GoogleLogin() {
    return { message: 'Redirigiendo a Google...' };
  }

  @Get('oauth2/callback')
  @UseGuards(AuthGuard('google'))
  async oauth2GoogleCallback(@Req() req, @Res() res) {
    const user = req.user;
    // Guardar o actualizar usuario en la base de datos
    let dbUser = await this.usersService.findByEmail(user.email);
    if (!dbUser) {
      // Asegurar que el nombre está en UTF-8 correcto
      const name = user.name ? Buffer.from(user.name, 'utf8').toString('utf8') : 'Google User';
      dbUser = await this.usersService.create({
        email: user.email,
        name: name,
        password: Math.random().toString(36).slice(-8), // random, no se usa
        role: 'socio',
      });
    } else {
      // Actualizar nombre si cambió
      if (dbUser.name !== user.name) {
        const name = user.name ? Buffer.from(user.name, 'utf8').toString('utf8') : dbUser.name;
        dbUser.name = name;
        await this.usersService.updateUser(dbUser); // Usar método público
      }
    }
    // Generar JWT con email, name y id - el nombre debe estar en UTF-8
    const payload = { email: dbUser.email, name: dbUser.name, id: dbUser.id };
    const token = this.jwtService.sign(payload);
    const frontendUrl = process.env.FRONTEND_URL || 'https://noxus.com.ar';
    res.redirect(`${frontendUrl}/login-success?token=${token}`);
  }
}