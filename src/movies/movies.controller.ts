import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('films')
@Controller('movies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @ApiOperation({ summary: "Récupérer les films actuellement à l'affiche" })
  @ApiResponse({
    status: 200,
    description: "Liste des films à l'affiche récupérée avec succès",
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur lors de la récupération des films',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de page pour la pagination',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Terme de recherche pour filtrer les films',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Critère de tri (popularity.desc, release_date.desc, etc.)',
  })
  @Get()
  async getNowPlaying(
    @Query(new ValidationPipe({ transform: true })) query: MovieQueryDto,
  ): Promise<{
    page: number;
    results: Array<Record<string, any>>;
    total_pages: number;
    total_results: number;
  }> {
    return this.moviesService.getNowPlaying(query);
  }
}
