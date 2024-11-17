import { IsString, IsArray, IsUrl, IsOptional } from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  types: string[];

  @IsUrl()
  imageUrl: string;
}

export class UpdatePokemonDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}