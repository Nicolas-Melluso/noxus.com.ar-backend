import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    // Si hay password, hashearlo antes de crear el usuario
    // Forzar solo los campos requeridos para Google OAuth2
    const bcrypt = require('bcrypt');
    const cleanData: Partial<User> = {
      name: userData.name || 'Google User',
      email: userData.email,
      password: await bcrypt.hash(userData.password || Math.random().toString(36).slice(-8), 10),
      role: userData.role || 'socio',
      refreshToken: userData.refreshToken || null
    };
    console.log('Creando usuario con:', cleanData);
    const user = this.userRepository.create(cleanData);
    return await this.userRepository.save(user);
  }

  async findOne(id: string | number): Promise<User> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await this.userRepository.findOne({ where: { id: numId } });
  }

  async updateRefreshToken(userId, refreshToken): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findByRole(role: User['role']): User[] {
    return this.users.filter(user => user.role === role);
  }

  assignRole(userId: string | number, role: User['role']): void {
    const numId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    const user = this.users.find(user => user.id === numId);
    if (user) {
      user.role = role;
    }
  }
}
