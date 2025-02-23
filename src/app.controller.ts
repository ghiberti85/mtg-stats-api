import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Application') // 🔹 Category in Swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Health Check' })
  @ApiResponse({ status: 200, description: 'API is running successfully' })
  getHello(): string {
    return this.appService.getHello();
  }
}
