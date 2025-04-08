// src/movies/dto/movie-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieQueryDto {
  @ApiPropertyOptional({
    description: 'Numéro de page pour la pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Terme de recherche pour filtrer les films',
    example: 'Avengers',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Critère de tri (popularity.desc, release_date.desc, etc.)',
    example: 'popularity.desc',
    default: 'popularity.desc',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'popularity.desc';
}
