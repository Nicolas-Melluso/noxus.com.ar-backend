import { Controller, Post, Body, HttpException, HttpStatus, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async oauthLogin(@Req() req, @Res() res) {
    // Redirect or handle OAuth2 login
    res.redirect('/dashboard');
  }
}