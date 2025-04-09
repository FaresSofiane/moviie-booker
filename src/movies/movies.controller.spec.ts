import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { ValidationPipe } from '@nestjs/common';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            getNowPlaying: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNowPlaying', () => {
    it('should call moviesService.getNowPlaying with the provided query parameters', async () => {
      // Arrange
      const queryParams: MovieQueryDto = {
        page: 2,
        search: 'Avengers',
        sort: 'popularity.desc',
      };

      const expectedResult = {
        page: 2,
        results: [{ id: 1, title: 'Avengers: Endgame' }],
        total_pages: 10,
        total_results: 100,
      };

      jest.spyOn(moviesService, 'getNowPlaying').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getNowPlaying(queryParams);

      // Assert
      expect(moviesService.getNowPlaying).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(expectedResult);
    });

    it('should pass default parameters when none are provided', async () => {
      // Arrange
      const queryParams = new MovieQueryDto();

      const expectedResult = {
        page: 1,
        results: [{ id: 1, title: 'Latest Movie' }],
        total_pages: 10,
        total_results: 100,
      };

      jest.spyOn(moviesService, 'getNowPlaying').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getNowPlaying(queryParams);

      // Assert
      expect(moviesService.getNowPlaying).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(expectedResult);
    });

    it('should handle search parameter correctly', async () => {
      // Arrange
      const queryParams: MovieQueryDto = {
        search: 'Star Wars',
      };

      const expectedResult = {
        page: 1,
        results: [{ id: 1, title: 'Star Wars: A New Hope' }],
        total_pages: 5,
        total_results: 50,
      };

      jest.spyOn(moviesService, 'getNowPlaying').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getNowPlaying(queryParams);

      // Assert
      expect(moviesService.getNowPlaying).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(expectedResult);
    });

    it('should handle sort parameter correctly', async () => {
      // Arrange
      const queryParams: MovieQueryDto = {
        sort: 'release_date.desc',
      };

      const expectedResult = {
        page: 1,
        results: [{ id: 1, title: 'New Release' }],
        total_pages: 10,
        total_results: 100,
      };

      jest.spyOn(moviesService, 'getNowPlaying').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getNowPlaying(queryParams);

      // Assert
      expect(moviesService.getNowPlaying).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const queryParams = new MovieQueryDto();
      const expectedError = new Error('Service error');

      jest.spyOn(moviesService, 'getNowPlaying').mockRejectedValue(expectedError);

      // Act & Assert
      await expect(controller.getNowPlaying(queryParams)).rejects.toThrow(expectedError);
    });
  });
});