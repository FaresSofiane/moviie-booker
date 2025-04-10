import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Moviie Booker API')
    .setDescription('API de réservation de films')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Entrez votre JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('films')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);

  const serverUrl = `https://moviie-booker-glep.onrender.com/`;
  setInterval(
    async () => {
      try {
        await fetch(serverUrl);
        console.log('Ping de maintien en activité effectué');
      } catch (error) {
        console.error('Erreur lors du ping de maintien en activité:', error);
      }
    },
    14 * 60 * 1000,
  );
}

bootstrap();
