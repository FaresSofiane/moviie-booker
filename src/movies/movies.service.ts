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
      // Construire l'URL pour les films à l'affiche
      let url = `${apiUrl}/movie/now_playing`;

      // Préparer les paramètres de requête
      const params: any = {
        page: queryParams.page || 1,
      };

      // Si un terme de recherche est fourni, on utilise l'endpoint de recherche
      if (queryParams.search) {
        url = `${apiUrl}/search/movie`;
        params.query = queryParams.search;
      }

      // Ajouter le paramètre de tri si spécifié
      if (queryParams.sort) {
        params.sort_by = queryParams.sort;
      }

      // Faire la requête HTTP vers l'API TMDB
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
