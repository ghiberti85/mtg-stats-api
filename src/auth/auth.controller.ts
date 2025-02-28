import {
  Controller,
  Post,
  Body,
  HttpCode,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { supabase } from '../supabaseClient';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: SignUpDto })
  async signUp(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { data, error } = await supabase.auth.signUp(body);
    if (error) {
      throw new HttpException(
        error.message || 'Signup error',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!data?.user) {
      throw new HttpException(
        'No user returned from Supabase',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    res.status(HttpStatus.CREATED);
    return { user: data.user, session: data.session };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: SignInDto })
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { data, error } = await supabase.auth.signInWithPassword(body);
    if (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Unknown error occurred',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (!data?.user) {
      throw new HttpException(
        'No user returned from Supabase',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    res.status(HttpStatus.OK);
    return { user: data.user, session: data.session };
  }
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Post('signout')
  @ApiOperation({ summary: 'Sign out a user' })
  @ApiResponse({ status: 200, description: 'User successfully signed out' })
  @ApiResponse({ status: 400, description: 'Error signing out user' })
  async signOut(): Promise<{ message: string }> {
    const { error } = await supabase.auth.signOut();
    if (error && typeof error === 'object' && 'message' in error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } else if (error) {
      throw new HttpException('Unknown error occurred', HttpStatus.BAD_REQUEST);
    }
    return { message: 'Successfully signed out' };
  }

  @ApiBearerAuth()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 400, description: 'Error refreshing token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new HttpException(
        `Refresh token error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.session) {
      throw new HttpException(
        'No session returned from Supabase',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }
}
