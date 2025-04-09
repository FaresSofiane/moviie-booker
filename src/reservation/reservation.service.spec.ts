import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { User } from '../user/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';
import { UserService } from '../user/user.service';
import { MoviesService } from '../movies/movies.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepository: Repository<Reservation>;
  let userService: UserService;
  let moviesService: MoviesService;

  const mockReservationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockMoviesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    userService = module.get<UserService>(UserService);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation successfully', async () => {
      const createDto = {
        userId: 1,
        movieId: 1,
        date: new Date(),
      };

      const user = { id: 1 } as User;
      const movie = { id: 1 } as Movie;
      const reservation = {
        id: 1,
        user,
        movie,
        date: createDto.date
      } as Reservation;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(moviesService, 'findOne').mockResolvedValue(movie);
      jest.spyOn(reservationRepository, 'create').mockReturnValue(reservation);
      jest.spyOn(reservationRepository, 'save').mockResolvedValue(reservation);

      const result = await service.create(createDto);

      expect(result).toEqual(reservation);
      expect(userService.findOne).toHaveBeenCalledWith(createDto.userId);
      expect(moviesService.findOne).toHaveBeenCalledWith(createDto.movieId);
      expect(reservationRepository.create).toHaveBeenCalledWith({
        user,
        movie,
        date: createDto.date,
      });
      expect(reservationRepository.save).toHaveBeenCalledWith(reservation);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const createDto = {
        userId: 999,
        movieId: 1,
        date: new Date(),
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(createDto.userId);
    });

    it('should throw NotFoundException when movie is not found', async () => {
      const createDto = {
        userId: 1,
        movieId: 999,
        date: new Date(),
      };

      const user = { id: 1 } as User;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(moviesService, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(createDto.userId);
      expect(moviesService.findOne).toHaveBeenCalledWith(createDto.movieId);
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const reservations = [
        { id: 1, user: { id: 1 }, movie: { id: 1 } },
        { id: 2, user: { id: 2 }, movie: { id: 2 } },
      ] as Reservation[];

      jest.spyOn(reservationRepository, 'find').mockResolvedValue(reservations);

      const result = await service.findAll();

      expect(result).toEqual(reservations);
      expect(reservationRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'movie'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      const reservation = {
        id: 1,
        user: { id: 1 },
        movie: { id: 1 },
      } as Reservation;

      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(reservation);

      const result = await service.findOne(1);

      expect(result).toEqual(reservation);
      expect(reservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'movie'],
      });
    });

    it('should throw NotFoundException when reservation is not found', async () => {
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(reservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['user', 'movie'],
      });
    });
  });
});