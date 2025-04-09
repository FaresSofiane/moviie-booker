// src/movies/dto/movie-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'Numéro de page pour la pagination',
    example: 1,
    default: 1,
  })
  page?: number = 1;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Terme de recherche pour filtrer les films',
    example: 'Avengers',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Critère de tri (popularity.desc, release_date.desc, etc.)',
    example: 'popularity.desc',
    default: 'popularity.desc',
  })
  sort?: string = 'popularity.desc';
}
