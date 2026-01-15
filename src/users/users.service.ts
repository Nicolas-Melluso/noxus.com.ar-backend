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
    const user = this.userRepository.create(userData);
    await user.saveWithHash();
    return await this.userRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateRefreshToken(userId, refreshToken): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findByRole(role: string): User[] {
    return this.users.filter(user => user.role === role);
  }

  assignRole(userId: string, role: string): void {
    const user = this.users.find(user => user.id === userId);
    if (user) {
      user.role = role;
    }
  }
}
