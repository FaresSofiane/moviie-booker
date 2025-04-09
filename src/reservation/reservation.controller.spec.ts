import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotFoundException } from '@nestjs/common';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservationService = {
    creerReservation: jest.fn(),
    getReservationsUtilisateur: jest.fn(),
    annulerReservation: jest.fn(),
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
    service = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('creer', () => {
    it('devrait créer une nouvelle réservation', async () => {
      // Arrange
      const createReservationDto: CreateReservationDto = {
        movieId: 1,
        dateHeure: '2023-06-01T14:00:00',
      };
      const userId = 1;
      const mockReservation = {
        id: 1,
        movieId: 1,
        dateHeure: new Date('2023-06-01T14:00:00'),
        userId: 1,
      };
      const mockRequest = { user: { id: userId } };

      mockReservationService.creerReservation.mockResolvedValue(
        mockReservation,
      );

      // Act
      const result = await controller.creer(createReservationDto, mockRequest);

      // Assert
      expect(service.creerReservation).toHaveBeenCalledWith(
        createReservationDto,
        userId,
      );
      expect(result).toEqual(mockReservation);
    });
  });

  describe('getMesReservations', () => {
    it("devrait retourner les réservations de l'utilisateur", async () => {
      // Arrange
      const userId = 1;
      const mockReservations = [
        {
          id: 1,
          movieId: 1,
          dateHeure: new Date('2023-06-01T14:00:00'),
          userId,
        },
        {
          id: 2,
          movieId: 2,
          dateHeure: new Date('2023-06-02T16:00:00'),
          userId,
        },
      ];
      const mockRequest = { user: { userId } };

      mockReservationService.getReservationsUtilisateur.mockResolvedValue(
        mockReservations,
      );

      // Act
      const result = await controller.getMesReservations(mockRequest);

      // Assert
      expect(service.getReservationsUtilisateur).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockReservations);
    });
  });

  describe('annuler', () => {
    it('devrait annuler une réservation avec succès', async () => {
      // Arrange
      const reservationId = '1';
      const userId = 1;
      const mockRequest = { user: { userId } };

      mockReservationService.annulerReservation.mockResolvedValue(undefined);

      // Act
      const result = await controller.annuler(reservationId, mockRequest);

      // Assert
      expect(service.annulerReservation).toHaveBeenCalledWith(
        +reservationId,
        userId,
      );
      expect(result).toEqual({ message: 'Réservation annulée avec succès' });
    });

    it("devrait lancer une exception si la réservation n'est pas trouvée", async () => {
      // Arrange
      const reservationId = '999';
      const userId = 1;
      const mockRequest = { user: { userId } };

      mockReservationService.annulerReservation.mockRejectedValue(
        new NotFoundException('Réservation introuvable'),
      );

      // Act & Assert
      await expect(
        controller.annuler(reservationId, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
