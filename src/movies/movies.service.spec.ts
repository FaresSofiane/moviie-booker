import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MovieQueryDto } from './dto/movie-query.dto';
import { AxiosResponse } from 'axios';

describe('MoviesService', () => {
  let service: MoviesService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNowPlaying', () => {
    it('should return now playing movies when no search parameter is provided', async () => {
      // Arrange
      const mockApiUrl = 'https://api.themoviedb.org/3';
      const mockApiKey = 'test-api-key';
      const queryParams: MovieQueryDto = { page: 1 };

      const mockResponse: AxiosResponse = {
        data: {
          page: 1,
          results: [{ id: 1, title: 'Test Movie' }],
          total_pages: 10,
          total_results: 100,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '' } as any,
      };

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TMDB_API_URL') return mockApiUrl;
        if (key === 'TMDB_API_KEY') return mockApiKey;
        return null;
      });

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      // Act
      const result = await service.getNowPlaying(queryParams);

      // Assert
      expect(configService.get).toHaveBeenCalledWith('TMDB_API_URL');
      expect(configService.get).toHaveBeenCalledWith('TMDB_API_KEY');
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockApiUrl}/movie/now_playing`,
        {
          headers: {
            Authorization: `Bearer ${mockApiKey}`,
            accept: 'application/json',
          },
          params: {
            page: 1,
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should use search/movie endpoint when search parameter is provided', async () => {
      // Arrange
      const mockApiUrl = 'https://api.themoviedb.org/3';
      const mockApiKey = 'test-api-key';
      const queryParams: MovieQueryDto = { page: 1, search: 'Avengers' };

      const mockResponse: AxiosResponse = {
        data: {
          page: 1,
          results: [{ id: 1, title: 'Avengers' }],
          total_pages: 5,
          total_results: 50,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '' } as any,
      };

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TMDB_API_URL') return mockApiUrl;
        if (key === 'TMDB_API_KEY') return mockApiKey;
        return null;
      });

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      // Act
      const result = await service.getNowPlaying(queryParams);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockApiUrl}/search/movie`,
        {
          headers: {
            Authorization: `Bearer ${mockApiKey}`,
            accept: 'application/json',
          },
          params: {
            page: 1,
            query: 'Avengers',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should include sort parameter when provided', async () => {
      // Arrange
      const mockApiUrl = 'https://api.themoviedb.org/3';
      const mockApiKey = 'test-api-key';
      const queryParams: MovieQueryDto = {
        page: 1,
        sort: 'release_date.desc',
      };

      const mockResponse: AxiosResponse = {
        data: {
          page: 1,
          results: [{ id: 1, title: 'New Movie' }],
          total_pages: 10,
          total_results: 100,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '' } as any,
      };

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TMDB_API_URL') return mockApiUrl;
        if (key === 'TMDB_API_KEY') return mockApiKey;
        return null;
      });

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      // Act
      const result = await service.getNowPlaying(queryParams);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockApiUrl}/movie/now_playing`,
        {
          headers: {
            Authorization: `Bearer ${mockApiKey}`,
            accept: 'application/json',
          },
          params: {
            page: 1,
            sort_by: 'release_date.desc',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException when API call fails', async () => {
      // Arrange
      const mockApiUrl = 'https://api.themoviedb.org/3';
      const mockApiKey = 'test-api-key';
      const queryParams: MovieQueryDto = { page: 1 };
      const errorResponse = {
        response: {
          status: 401,
          data: {
            status_message: 'Invalid API key',
          },
        },
      };

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TMDB_API_URL') return mockApiUrl;
        if (key === 'TMDB_API_KEY') return mockApiKey;
        return null;
      });

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => errorResponse));

      // Act & Assert
      await expect(service.getNowPlaying(queryParams)).rejects.toThrowError(
        new HttpException('Invalid API key', 401),
      );
    });

    it('should use default error message when API error has no status_message', async () => {
      // Arrange
      const mockApiUrl = 'https://api.themoviedb.org/3';
      const mockApiKey = 'test-api-key';
      const queryParams: MovieQueryDto = { page: 1 };
      const errorResponse = {
        response: {
          status: 500,
          data: {},
        },
      };

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TMDB_API_URL') return mockApiUrl;
        if (key === 'TMDB_API_KEY') return mockApiKey;
        return null;
      });

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => errorResponse));

      // Act & Assert
      await expect(service.getNowPlaying(queryParams)).rejects.toThrowError(
        new HttpException(
          'Une erreur est survenue lors de la récupération des films',
          500,
        ),
      );
    });

    it('should use INTERNAL_SERVER_ERROR when no status code in error', async () => {
      // Arrange
      const mockApiUrl = 'https://api.themoviedb.org/3';
      const mockApiKey = 'test-api-key';
      const queryParams: MovieQueryDto = { page: 1 };
      const errorResponse = {};

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TMDB_API_URL') return mockApiUrl;
        if (key === 'TMDB_API_KEY') return mockApiKey;
        return null;
      });

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => errorResponse));

      // Act & Assert
      await expect(service.getNowPlaying(queryParams)).rejects.toThrowError(
        new HttpException(
          'Une erreur est survenue lors de la récupération des films',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
