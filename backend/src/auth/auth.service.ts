import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.userService.create(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );

      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
