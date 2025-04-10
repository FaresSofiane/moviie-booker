import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID du film à réserver' })
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @ApiProperty({ description: 'Date et heure de la réservation (format ISO)' })
  @IsNotEmpty()
  @IsDateString()
  dateHeure: string;
}
