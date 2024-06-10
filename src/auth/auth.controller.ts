import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, User as UserModel } from '@prisma/client';

import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role?: UserModel['role'];
    },
  ): Promise<{
    status: string;
    message: string;
  }> {
    try {
      const { email, name, password, role } = body;
      const encryptPassword = await bcrypt.hash(password, 10);

      const data = {
        email,
        name,
        password: encryptPassword,
        role,
      };

      await this.userService.createUser(data);
      return {
        status: 'success',
        message: 'success create a user',
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new HttpException(
            {
              status: 'failed',
              message: 'email already exist',
            },
            HttpStatus.BAD_REQUEST,
            {
              cause: err,
            },
          );
        }
        if (err.code === 'P2012') {
          throw new HttpException(
            {
              status: 'failed',
              message: `missing a required value`,
            },
            HttpStatus.BAD_REQUEST,
            {
              cause: err,
            },
          );
        }
      }
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
    @Res() res: Response,
  ): Promise<any> {
    const { email, password } = body;

    const { access_token } = await this.authService.signIn(email, password);

    return res
      .setHeader('Authorization', access_token)
      .json({ status: 'success' })
      .status(200);
  }
}
