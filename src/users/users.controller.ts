import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint temporal para probar creación manual
  @Post('test-create')
  async testCreate(@Body() body: Partial<User>) {
    return await this.usersService.create(body);
  }

  @Post()
  async create(@Body() userData: Partial<User>) {
    return await this.usersService.create(userData);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }
}