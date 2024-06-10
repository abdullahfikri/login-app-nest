import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, UserService, AuthService],
})
export class AuthModule {}
