// src/database/database.controller.ts
import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { supabase } from '../supabaseClient';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Database') // 🔹 Categoria "Database" no Swagger
@Controller('database')
export class DatabaseController {
  @Get('health')
  @ApiOperation({ summary: 'Check database connection health' })
  @ApiResponse({
    status: 200,
    description: 'Database connection established successfully',
  })
  @ApiResponse({ status: 500, description: 'Failed to connect to database' })
  async healthCheck() {
    // Try a simple query: fetching a limited set of data
    const { data, error } = await supabase.from('matches').select('*').limit(1);

    if (error) {
      throw new InternalServerErrorException(
        `Connection error: ${error.message}`,
      );
    }

    return {
      message: 'Successfully connected to Supabase!',
      sampleData: data,
    };
  }
}
