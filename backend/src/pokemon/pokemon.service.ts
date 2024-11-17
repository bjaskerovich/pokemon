import { 
    Injectable, 
    Logger, 
    HttpException, 
    HttpStatus, 
    OnModuleInit,
    NotFoundException
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Pokemon } from './entities/pokemon.entity';
  import { RedisService } from '../redis/redis.service';
  import { CreatePokemonDto, UpdatePokemonDto } from './dto/pokemon.dto';
  import axios from 'axios';
  
  @Injectable()
  export class PokemonService implements OnModuleInit {
    private readonly logger = new Logger(PokemonService.name);
  
    constructor(
      @InjectRepository(Pokemon)
      private pokemonRepository: Repository<Pokemon>,
      private redisService: RedisService,
    ) {}
  
    async onModuleInit() {
      try {
        const count = await this.pokemonRepository.count();
        if (count === 0) {
          this.logger.log('Initializing Pokemon database with default data...');
          await this.initializeDefaultPokemon();
        }
      } catch (error) {
        this.logger.error('Failed to initialize Pokemon data:', error);
      }
    }
  
    private async initializeDefaultPokemon() {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=30');
        const pokemons = response.data.results;
  
        for (const pokemon of pokemons) {
          const detailResponse = await axios.get(pokemon.url);
          const pokemonData = {
            name: pokemon.name,
            types: detailResponse.data.types.map(t => t.type.name),
            imageUrl: detailResponse.data.sprites.front_default,
          };
  
          await this.pokemonRepository.save(pokemonData);
          this.logger.log(`Added Pokemon: ${pokemon.name}`);
        }
  
        await this.redisService.del('all_pokemon');
        this.logger.log('Successfully initialized Pokemon database');
      } catch (error) {
        this.logger.error('Error initializing Pokemon data:', error);
        throw new HttpException(
          'Failed to initialize Pokemon data',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async findAll() {
      try {
        const cachedPokemon = await this.redisService.get('all_pokemon');
        if (cachedPokemon) {
          return JSON.parse(cachedPokemon);
        }
  
        const pokemon = await this.pokemonRepository.find({
          order: { id: 'ASC' },
        });
  
        if (pokemon.length > 0) {
          await this.redisService.set('all_pokemon', JSON.stringify(pokemon));
        }
        return pokemon;
      } catch (error) {
        this.logger.error('Error fetching Pokemon:', error);
        throw new HttpException(
          'Failed to fetch Pokemon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async findOne(id: number) {
      const pokemon = await this.pokemonRepository.findOne({ where: { id } });
      if (!pokemon) {
        throw new NotFoundException(`Pokemon with ID ${id} not found`);
      }
      return pokemon;
    }
  
    async create(createPokemonDto: CreatePokemonDto) {
      try {
        const pokemon = this.pokemonRepository.create(createPokemonDto);
        const saved = await this.pokemonRepository.save(pokemon);
        await this.redisService.del('all_pokemon');
        return saved;
      } catch (error) {
        this.logger.error('Error creating Pokemon:', error);
        throw new HttpException(
          'Failed to create Pokemon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async update(id: number, updatePokemonDto: UpdatePokemonDto) {
      try {
        const pokemon = await this.findOne(id);
        Object.assign(pokemon, updatePokemonDto);
        const updated = await this.pokemonRepository.save(pokemon);
        await this.redisService.del('all_pokemon');
        return updated;
      } catch (error) {
        this.logger.error(`Error updating Pokemon ${id}:`, error);
        throw new HttpException(
          'Failed to update Pokemon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async remove(id: number) {
      try {
        const pokemon = await this.findOne(id);
        await this.pokemonRepository.remove(pokemon);
        await this.redisService.del('all_pokemon');
        return { message: `Pokemon ${id} successfully deleted` };
      } catch (error) {
        this.logger.error(`Error deleting Pokemon ${id}:`, error);
        throw new HttpException(
          'Failed to delete Pokemon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async reinitializeData() {
      try {
        await this.pokemonRepository.clear();
        await this.redisService.del('all_pokemon');
        await this.initializeDefaultPokemon();
        return { message: 'Pokemon data reinitialized successfully' };
      } catch (error) {
        this.logger.error('Error reinitializing Pokemon data:', error);
        throw new HttpException(
          'Failed to reinitialize Pokemon data',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }