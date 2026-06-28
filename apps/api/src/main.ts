/**
 * Application entry point — bootstraps the NestJS application.
 *
 * Environment variables used here:
 *   PORT         — HTTP port (Railway injects this automatically)
 *   CORS_ORIGIN  — comma-separated allowed origins, e.g.
 *                  "https://life-tracker.netlify.app,https://custom-domain.com"
 *                  Leave unset in development to allow all origins.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // ── Global validation pipe ──────────────────────────────────────
  // Automatically validates incoming request bodies against DTO classes.
  // whitelist  — strips unknown properties from request body
  // transform  — converts plain JSON objects into typed DTO instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ── CORS configuration ─────────────────────────────────────────
  // In production, set CORS_ORIGIN to your Netlify URL (or custom domain).
  // In development, allow all origins so micro-frontend dev servers can reach us.
  const rawOrigin = process.env.CORS_ORIGIN;
  const corsOrigin = rawOrigin
    ? rawOrigin.split(',').map((o) => o.trim())  // ["https://app.netlify.app"]
    : true;                                        // allow everything in dev

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Listen ─────────────────────────────────────────────────────
  // Railway injects PORT automatically. We bind to 0.0.0.0 so the
  // server accepts connections from outside the container (not just localhost).
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`API running on port ${port}`);
}

bootstrap();
