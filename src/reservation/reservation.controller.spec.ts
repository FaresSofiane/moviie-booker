import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';

describe('ReservationController', () => {
  let controller: ReservationController;
  let reservationService: ReservationService;

  const mockReservationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    reservationService = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createDto: CreateReservationDto = {
        userId: 1,
        movieId: 1,
        date: new Date(),
      };

      const reservation = {
        id: 1,
        user: { id: 1 },
        movie: { id: 1 },
        date: createDto.date,
      } as Reservation;

      jest.spyOn(reservationService, 'create').mockResolvedValue(reservation);

      const result = await controller.create(createDto);

      expect(result).toEqual(reservation);
      expect(reservationService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const reservations = [
        { id: 1, user: { id: 1 }, movie: { id: 1 } },
        { id: 2, user: { id: 2 }, movie: { id: 2 } },
      ] as Reservation[];

      jest.spyOn(reservationService, 'findAll').mockResolvedValue(reservations);

      const result = await controller.findAll();

      expect(result).toEqual(reservations);
      expect(reservationService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      const reservation = {
        id: 1,
        user: { id: 1 },
        movie: { id: 1 },
      } as Reservation;

      jest.spyOn(reservationService, 'findOne').mockResolvedValue(reservation);

      const result = await controller.findOne('1');

      expect(result).toEqual(reservation);
      expect(reservationService.findOne).toHaveBeenCalledWith(1);
    });
  });
});
