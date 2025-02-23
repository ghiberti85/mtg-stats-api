// src/players/players.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PlayersService } from './players.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Players')
@ApiExtraModels(CreatePlayerDto, UpdatePlayerDto)
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @ApiBearerAuth() // Requires Bearer authentication
  @UseGuards(SupabaseAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new player' })
  @ApiResponse({ status: 201, description: 'Player successfully created' })
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto): Promise<any> {
    return await this.playersService.createPlayer(createPlayerDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all players' })
  @ApiResponse({ status: 200, description: 'List of players returned' })
  async getAllPlayers() {
    return await this.playersService.getPlayers();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a player by ID' })
  @ApiResponse({ status: 200, description: 'Player found' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async getPlayerById(@Param('id') id: string) {
    return await this.playersService.getPlayerById(id);
  }

  @Public()
  @Get('stats/:id')
  @ApiOperation({ summary: 'Get player statistics' })
  @ApiResponse({
    status: 200,
    description: 'Player statistics returned successfully',
  })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async getPlayerStats(@Param('id') id: string) {
    return await this.playersService.getPlayerStats(id);
  }

  @ApiBearerAuth() // Requires Bearer authentication
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a player' })
  @ApiResponse({ status: 200, description: 'Player updated successfully' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async updatePlayer(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return await this.playersService.updatePlayer(id, updatePlayerDto);
  }

  @ApiBearerAuth() // Requires Bearer authentication
  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a player' })
  @ApiResponse({ status: 200, description: 'Player successfully removed' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async deletePlayer(@Param('id') id: string) {
    return await this.playersService.deletePlayer(id);
  }
}
