import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
  } from '@nestjs/common';
  import { PokemonService } from './pokemon.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { CreatePokemonDto, UpdatePokemonDto } from './dto/pokemon.dto';
  
  @Controller('pokemon')
  @UseGuards(JwtAuthGuard)
  export class PokemonController {
    constructor(private readonly pokemonService: PokemonService) {}
  
    @Get()
    findAll() {
      return this.pokemonService.findAll();
    }
  
    @Post('initialize')
    reinitializeData() {
      return this.pokemonService.reinitializeData();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.pokemonService.findOne(id);
    }
  
    @Post()
    create(@Body() createPokemonDto: CreatePokemonDto) {
      return this.pokemonService.create(createPokemonDto);
    }
  
    @Put(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updatePokemonDto: UpdatePokemonDto,
    ) {
      return this.pokemonService.update(id, updatePokemonDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.pokemonService.remove(id);
    }
  }