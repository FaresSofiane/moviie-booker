import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "Nom d'utilisateur",
    example: 'JohnDoe',
  })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'mail@mail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'Password123!',
  })
  password: string;
}
