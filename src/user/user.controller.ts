// src/user/user.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body()
    createUserDto: {
      username: string;
      email: string;
      password: string;
    },
  ) {
    return this.userService.create(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }
}
