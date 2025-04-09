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
  ApiBearerAuth, ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('films')
@Controller('movies')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @ApiOperation({ summary: "Récupérer les films actuellement à l'affiche" })
  @ApiResponse({
    status: 200,
    description: "Liste des films récupérés avec succès",
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur : Impossible de récupérer les films',
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
    description: 'Valeur de recherche pour filtrer les films',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Critere de tri comme popularity.desc ou release_date.desc',
  })
  @Get()
  @ApiBody({type: MovieQueryDto})
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
