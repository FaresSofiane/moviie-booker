import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'mail@mail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'Password123!',
  })
  password: string;
}
