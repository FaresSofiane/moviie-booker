import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';

@ApiTags('reservations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle réservation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Réservation créée avec succès',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides ou conflit de réservation',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié',
  })
  async creer(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req,
  ) {
    return this.reservationService.creerReservation(
      createReservationDto,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: "Récupérer les réservations de l'utilisateur" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Liste des réservations de l'utilisateur",
    type: [ReservationResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié',
  })
  async getMesReservations(@Request() req) {
    return this.reservationService.getReservationsUtilisateur(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une réservation' })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la réservation à annuler',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Réservation annulée avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Réservation annulée avec succès',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Réservation introuvable',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié',
  })
  async annuler(@Param('id') id: string, @Request() req) {
    await this.reservationService.annulerReservation(+id, req.user.userId);
    return { message: 'Réservation annulée avec succès' };
  }
}
