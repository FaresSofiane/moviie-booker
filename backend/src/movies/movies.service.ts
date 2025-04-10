import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MovieQueryDto } from './dto/movie-query.dto';

@Injectable()
export class MoviesService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getNowPlaying(queryParams: MovieQueryDto) {
    const apiUrl = this.configService.get<string>('TMDB_API_URL');
    const apiKey = this.configService.get<string>('TMDB_API_KEY');

    try {
      let url = `${apiUrl}/movie/now_playing`;

      const params: {
        page: number;
        query?: string;
        sort_by?: string;
      } = {
        page: queryParams.page || 1,
      };

      if (queryParams.search) {
        url = `${apiUrl}/search/movie`;
        params.query = queryParams.search;
      }

      if (queryParams.sort) {
        params.sort_by = queryParams.sort;
      }

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            accept: 'application/json',
          },
          params,
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.status_message ||
          'Une erreur est survenue lors de la récupération des films',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
