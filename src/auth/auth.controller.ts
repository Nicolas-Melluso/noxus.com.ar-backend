import { Controller, Post, Body, HttpException, HttpStatus, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
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

  @Get('oauth2')
  @UseGuards(AuthGuard('oauth2'))
  async oauthLogin(@Req() req) {
    // El flujo de OAuth2 redirige automáticamente al proveedor
    return { message: 'Redirigiendo a proveedor OAuth2...' };
  }

  @Get('oauth2/callback')
  @UseGuards(AuthGuard('oauth2'))
  async oauthCallback(@Req() req, @Res() res) {
    // Generar un JWT para el usuario autenticado
    const user = req.user;
    // Puedes adaptar los campos según tu modelo
    const payload = { email: user.email, sub: user.id || user.sub, role: user.role || 'user' };
    const token = this.jwtService.sign(payload);
    // Redirigir al frontend SPA con el token como query param
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    res.redirect(`${frontendUrl}/login-success?token=${token}`);
  }
}