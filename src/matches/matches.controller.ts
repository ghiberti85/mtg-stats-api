import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('matches') // Agrupa os endpoints no Swagger
@ApiExtraModels(CreateMatchDto, UpdateMatchDto)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiBearerAuth() // Adiciona autenticação Bearer para toda a rota
  @UseGuards(SupabaseAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({
    status: 201,
    description: 'Match created successfully',
    type: CreateMatchDto,
  })
  @ApiResponse({ status: 400, description: 'Error creating match' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createMatch(
    @Body() createMatchDto: CreateMatchDto,
  ): Promise<CreateMatchDto> {
    return await this.matchesService.createMatch(createMatchDto);
  }

  // ✅ Endpoint para listar todas as partidas ou filtrar por playerId
  @Public() // Define o endpoint como público
  @Get()
  @ApiOperation({ summary: 'List all registered matches' })
  @ApiResponse({
    status: 200,
    description: 'Match list returned successfully',
    type: [CreateMatchDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMatches(
    @Query('playerId') playerId?: string,
  ): Promise<CreateMatchDto[]> {
    return await this.matchesService.getMatches(playerId);
  }

  // ✅ Endpoint para obter uma partida específica pelo ID
  @Public() // Define o endpoint como público
  @Get(':id')
  @ApiOperation({ summary: 'Get a match by ID' })
  @ApiResponse({
    status: 200,
    description: 'Match found',
    type: CreateMatchDto,
  })
  @ApiResponse({ status: 404, description: 'Remove the match' })
  async getMatchById(@Param('id') id: string): Promise<CreateMatchDto> {
    return await this.matchesService.getMatchById(id);
  }

  // ✅ Endpoint para atualizar uma partida pelo ID
  @ApiBearerAuth() // Adiciona autenticação Bearer para toda a rota
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing match' })
  @ApiResponse({
    status: 200,
    description: 'Match updated successfully',
    type: UpdateMatchDto,
  })
  @ApiResponse({ status: 404, description: 'Remove the match' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMatch(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<UpdateMatchDto> {
    return await this.matchesService.updateMatch(id, updateMatchDto);
  }

  // ✅ Endpoint para excluir uma partida pelo ID
  @ApiBearerAuth() // Adiciona autenticação Bearer para toda a rota
  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove the match' })
  @ApiResponse({ status: 200, description: 'Match removed successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 401, description: 'Match not found' })
  async deleteMatch(@Param('id') id: string): Promise<{ message: string }> {
    return await this.matchesService.deleteMatch(id);
  }
}
