import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReservationService', () => {
  let service: ReservationService;
  let repository: Repository<Reservation>;

  const mockReservationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    repository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('creerReservation', () => {
    it('devrait créer une réservation avec succès', async () => {
      // Arrange
      const userId = 1;
      const createReservationDto: CreateReservationDto = {
        movieId: 1,
        dateHeure: '2023-06-01T14:00:00',
      };

      const mockReservation = new Reservation();
      mockReservation.id = 1;
      mockReservation.movieId = createReservationDto.movieId;
      mockReservation.dateHeure = new Date(createReservationDto.dateHeure);
      mockReservation.userId = userId;

      mockReservationRepository.find.mockResolvedValue([]);
      mockReservationRepository.save.mockResolvedValue(mockReservation);

      // Act
      const result = await service.creerReservation(
        createReservationDto,
        userId,
      );

      // Assert
      expect(repository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          movieId: createReservationDto.movieId,
          dateHeure: new Date(createReservationDto.dateHeure),
          userId,
        }),
      );
      expect(result).toEqual(mockReservation);
    });

    it('devrait rejeter si userId est manquant', async () => {
      // Arrange
      const createReservationDto: CreateReservationDto = {
        movieId: 1,
        dateHeure: '2023-06-01T14:00:00',
      };

      // Act & Assert
      await expect(
        service.creerReservation(createReservationDto, 0), // Utiliser 0 au lieu de undefined
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.creerReservation(createReservationDto, 0), // Utiliser 0 au lieu de undefined
      ).rejects.toThrow('ID utilisateur manquant');
    });

    it('devrait rejeter en cas de conflit de réservation', async () => {
      // Arrange
      const userId = 1;
      const createReservationDto: CreateReservationDto = {
        movieId: 1,
        dateHeure: '2023-06-01T14:00:00',
      };

      const existingReservation = new Reservation();
      existingReservation.id = 2;
      existingReservation.movieId = 2;
      existingReservation.dateHeure = new Date('2023-06-01T13:30:00');
      existingReservation.userId = userId;

      mockReservationRepository.find.mockResolvedValue([existingReservation]);

      // Act & Assert
      await expect(
        service.creerReservation(createReservationDto, userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.creerReservation(createReservationDto, userId),
      ).rejects.toThrow(
        'Impossible de réserver pendant cette plage horaire, vous avez déjà un film programmé',
      );
    });
  });

  describe('getReservationsUtilisateur', () => {
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

      mockReservationRepository.find.mockResolvedValue(mockReservations);

      // Act
      const result = await service.getReservationsUtilisateur(userId);

      // Assert
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { dateHeure: 'ASC' },
      });
      expect(result).toEqual(mockReservations);
    });
  });

  describe('annulerReservation', () => {
    it('devrait annuler une réservation avec succès', async () => {
      // Arrange
      const reservationId = 1;
      const userId = 1;

      const mockReservation = new Reservation();
      mockReservation.id = reservationId;
      mockReservation.movieId = 1;
      mockReservation.dateHeure = new Date('2023-06-01T14:00:00');
      mockReservation.userId = userId;

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.remove.mockResolvedValue(undefined);

      // Act
      await service.annulerReservation(reservationId, userId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId, userId },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockReservation);
    });

    it("devrait lancer une exception si la réservation n'est pas trouvée", async () => {
      // Arrange
      const reservationId = 999;
      const userId = 1;

      mockReservationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.annulerReservation(reservationId, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.annulerReservation(reservationId, userId),
      ).rejects.toThrow('Réservation introuvable');
    });
  });
});
