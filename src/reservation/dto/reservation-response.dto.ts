import { ApiProperty } from '@nestjs/swagger';

export class ReservationResponseDto {
  @ApiProperty({ description: 'Identifiant unique de la réservation' })
  id: number;

  @ApiProperty({ description: 'ID du film réservé' })
  movieId: number;

  @ApiProperty({ description: 'Date et heure de la réservation' })
  dateHeure: Date;

  @ApiProperty({ description: "ID de l'utilisateur qui a fait la réservation" })
  userId: number;
}
