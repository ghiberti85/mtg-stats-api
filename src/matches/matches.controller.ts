// src/matches/matches.controller.ts

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
  InternalServerErrorException,
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
import { MatchResult } from '../enums/match-result.enum';

@ApiTags('Matches')
@ApiExtraModels(CreateMatchDto, UpdateMatchDto)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiBearerAuth()
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
    // Normaliza o campo result para minúsculas
    const normalized = createMatchDto.result.toLowerCase();
    if (normalized === 'win') {
      createMatchDto.result = MatchResult.WIN;
    } else if (normalized === 'loss') {
      createMatchDto.result = MatchResult.LOSS;
    } else if (normalized === 'draw') {
      createMatchDto.result = MatchResult.DRAW;
    } else {
      throw new InternalServerErrorException('Invalid match result');
    }
    // Chama o serviço para criar a partida
    const createdMatch = await this.matchesService.createMatch(createMatchDto);
    return {
      ...createdMatch,
      result: createdMatch.result as unknown as MatchResult,
    };
  }

  @Public()
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

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a match by ID' })
  @ApiResponse({
    status: 200,
    description: 'Match found',
    type: CreateMatchDto,
  })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async getMatchById(@Param('id') id: string): Promise<CreateMatchDto> {
    return await this.matchesService.getMatchById(id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing match' })
  @ApiResponse({
    status: 200,
    description: 'Match updated successfully',
    type: UpdateMatchDto,
  })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMatch(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<UpdateMatchDto> {
    return await this.matchesService.updateMatch(id, updateMatchDto);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove the match' })
  @ApiResponse({ status: 200, description: 'Match removed successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteMatch(@Param('id') id: string): Promise<{ message: string }> {
    return await this.matchesService.deleteMatch(id);
  }
}
