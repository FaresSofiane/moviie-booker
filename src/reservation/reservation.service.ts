import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
  ) {}

  async creerReservation(
    createReservationDto: CreateReservationDto,
    userId: number,
  ): Promise<Reservation> {
    const nouvelleDate = new Date(createReservationDto.dateHeure);

    const reservationsUtilisateur = await this.reservationRepo.find({
      where: { userId },
    });

    for (const reservation of reservationsUtilisateur) {
      const debutReservation = new Date(reservation.dateHeure);
      const finReservation = new Date(debutReservation);
      finReservation.setHours(finReservation.getHours() + 2);

      const nouvelleFinReservation = new Date(nouvelleDate);
      nouvelleFinReservation.setHours(nouvelleFinReservation.getHours() + 2);

      if (
        (nouvelleDate >= debutReservation && nouvelleDate < finReservation) ||
        (nouvelleFinReservation > debutReservation &&
          nouvelleFinReservation <= finReservation) ||
        (nouvelleDate <= debutReservation &&
          nouvelleFinReservation >= finReservation)
      ) {
        throw new BadRequestException(
          'Impossible de réserver pendant cette plage horaire, vous avez déjà un film programmé',
        );
      }
    }

    const nouvelleReservation = this.reservationRepo.create({
      movieId: createReservationDto.movieId,
      dateHeure: nouvelleDate,
      userId,
    });

    return this.reservationRepo.save(nouvelleReservation);
  }

  async getReservationsUtilisateur(userId: number): Promise<Reservation[]> {
    return this.reservationRepo.find({
      where: { userId },
      order: { dateHeure: 'ASC' },
    });
  }

  async annulerReservation(id: number, userId: number): Promise<void> {
    const reservation = await this.reservationRepo.findOne({
      where: { id, userId },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    await this.reservationRepo.remove(reservation);
  }
}
