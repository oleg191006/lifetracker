/**
 * DatabaseModule — sets up the TypeORM connection for the entire NestJS app.
 *
 * Uses `TypeOrmModule.forRoot()` with our shared `dataSourceOptions`.
 * Because this module is imported in AppModule, every other module can use
 * `TypeOrmModule.forFeature([SomeEntity])` to get repository injection.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    // forRoot() registers the TypeORM connection globally.
    // All entities discovered via the `entities` glob in dataSourceOptions
    // will have their tables created/updated automatically.
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
})
export class DatabaseModule {}
