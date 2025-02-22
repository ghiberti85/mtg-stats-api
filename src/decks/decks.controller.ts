// src/decks/decks.controller.ts
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
import { DecksService } from './decks.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Decks')
@ApiExtraModels(CreateDeckDto, UpdateDeckDto)
@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @ApiBearerAuth() // Requer autenticação Bearer
  @UseGuards(SupabaseAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new deck' })
  @ApiResponse({ status: 201, description: 'Deck created successfully' })
  async createDeck(@Body() createDeckDto: CreateDeckDto) {
    return await this.decksService.createDeck(createDeckDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all decks' })
  @ApiResponse({ status: 200, description: 'Decklist returned' })
  async getAllDecks() {
    return await this.decksService.getDecks();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Search for a deck by ID' })
  @ApiResponse({ status: 200, description: 'Deck found' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async getDeckById(@Param('id') id: string) {
    return await this.decksService.getDeckById(id);
  }

  @ApiBearerAuth() // Requer autenticação Bearer
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a deck' })
  @ApiResponse({ status: 200, description: 'Updated deck' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async updateDeck(
    @Param('id') id: string,
    @Body() updateDeckDto: UpdateDeckDto,
  ) {
    return await this.decksService.updateDeck(id, updateDeckDto);
  }

  @ApiBearerAuth() // Requer autenticação Bearer
  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a deck' })
  @ApiResponse({ status: 200, description: 'Deck successfully removed' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async deleteDeck(@Param('id') id: string) {
    return await this.decksService.deleteDeck(id);
  }
}
