import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
      ) {}
    
      findAll(): Promise<User[]> {
        return this.usersRepository.find();
      }
    
      findOne(userId: number): Promise<User> {
        return this.usersRepository.findOneBy({ userId });
      }
    
      create(user: Partial<User>): Promise<User> {
        return this.usersRepository.save(user);
      }
    
      async update(id: number, user: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, user);
        return this.findOne(id);
      }
    
      async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
      }
}
