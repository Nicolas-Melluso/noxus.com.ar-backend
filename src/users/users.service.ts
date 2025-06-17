import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
      ) {}
    
      async findOneByEmail(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { email } });
      }

      findAll(): Promise<User[]> {
        return this.usersRepository.find();
      }
    
      findOne(userId: number): Promise<User> {
        return this.usersRepository.findOneBy({ userId });
      }
    
      async create(user: Partial<User>): Promise<User> {
        let passHashed: string;

        console.log(user);
        
        if (user.password) {
          try {
            passHashed = await new Promise<string>((resolve, reject) => {
              bcrypt.hash(user.password!, 7, (err, hash) => {
                if (err) {
                  console.error("Algo salió mal hasheando la contraseña", err);
                  reject(err);
                } else {
                  resolve(hash);
                }
              });
            });

            user.password = passHashed;
          } catch (error) {
            throw new Error("Error al encriptar la contraseña");
          }
        }

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
