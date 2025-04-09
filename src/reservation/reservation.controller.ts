import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@ApiTags('reservations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle réservation' })
  async creer(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req,
  ) {
    return this.reservationService.creerReservation(
      createReservationDto,
      req.user.userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer les réservations de l'utilisateur" })
  async getMesReservations(@Request() req) {
    return this.reservationService.getReservationsUtilisateur(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Annuler une réservation' })
  async annuler(@Param('id') id: string, @Request() req) {
    await this.reservationService.annulerReservation(+id, req.user.userId);
    return { message: 'Réservation annulée avec succès' };
  }
}
