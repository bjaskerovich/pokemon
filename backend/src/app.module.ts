import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { RedisModule } from './redis/redis.module';
import { User } from './auth/entities/user.entity';
import { Pokemon } from './pokemon/entities/pokemon.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'pokemon_user',
      password: process.env.DB_PASSWORD || 'pokemon_pass',
      database: process.env.DB_DATABASE || 'pokemon_db',
      entities: [User, Pokemon],
      synchronize: true, // Don't use in production
    }),
    AuthModule,
    PokemonModule,
    RedisModule,
  ],
})
export class AppModule {}