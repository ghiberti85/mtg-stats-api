import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('MTG Stats API')
    .setDescription('API para gerenciamento de partidas de Magic')
    .setVersion('1.0')
    .addBearerAuth() // Adiciona a opção de autenticação Bearer (para JWT/Supabase tokens)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // (Opcional) Configurar um filtro global de exceções
  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
});
