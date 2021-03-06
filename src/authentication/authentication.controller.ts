import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Res,
  Get,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { LocalAuthenticationGuard } from './guards/localAuthentication.guard';
import JwtAuthenticationGuard from './guards/jwtAuthentication-guard';
import { forbidUnknownValues } from '../posts/util/forbidUnknownValues';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  // Check data of user logged in
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }

  @Post('register')
  async register(
    @Body(new ValidationPipe(forbidUnknownValues))
    registrationData: RegisterDto,
  ) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
    console.log(cookie);
    response.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return response.send(user);
  }

  @Post('logout')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    return response.sendStatus(200);
  }
}
