// src/database/database.controller.ts
import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { supabase } from '../supabaseClient';

@Controller('database')
export class DatabaseController {
  @Get('health')
  async healthCheck() {
    // Tentamos uma consulta simples: obter a lista de tabelas ou uma query trivial.
    const { data, error } = await supabase.from('matches').select('*').limit(1);

    if (error) {
      throw new InternalServerErrorException(
        `Erro de conexão: ${error.message}`,
      );
    }

    return {
      message: 'Conexão com o Supabase estabelecida com sucesso!',
      sampleData: data,
    };
  }
}
