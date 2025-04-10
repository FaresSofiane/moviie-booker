import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    if (isNaN(id)) {
      return undefined;
    }
    const user = await this.userRepository.findOne({ where: { id } });
    return user || undefined;
  }

  async create(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log('Validating user with email:', email);
    const user = await this.findByEmail(email);

    if (!user) {
      console.log('User not found');
      return null;
    }
    console.log('User found:', user);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return null;
    }
    console.log('Password valid:', isPasswordValid);

    return user;
  }
}
