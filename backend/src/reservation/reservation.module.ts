import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
