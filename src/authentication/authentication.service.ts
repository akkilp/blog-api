import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import RegisterDto from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/tokenPayload.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async checkAdminPassword(password: string) {
    const adminPassword = await bcrypt.hash(
      this.configService.get('ADMIN_PASSWORD'),
      10,
    );

    const isValid = await bcrypt.compare(password, adminPassword);

    if (!isValid) {
      throw new HttpException('Invalid admin password', HttpStatus.FORBIDDEN);
    }
  }

  public async register(registrationData: RegisterDto) {
    await this.checkAdminPassword(registrationData.adminPassword);
    registrationData.adminPassword = undefined;

    // Make hash out of plain text
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);

    try {
      const hashedData = {
        ...registrationData,
        password: hashedPassword,
      };

      const createdUser = await this.usersService.create(hashedData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userData } = createdUser; // Remove password from the response
      return userData;
    } catch (error) {
      // Error code for duplicate email in db
      if (error?.code === '23505') {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    throw new HttpException(
      'Something went wrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /* Check user based on email search */
  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /* Compare inserted password with the hashed one in DB */
  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; Domain=https://blog-client-nine.vercel.app; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}; SameSite=None; Secure; HttpOnly`;
  }

  public getCookieForLogOut() {
    return `Authentication=; Domain=https://blog-client-nine.vercel.app; Path=/; Max-Age=0; SameSite=None; Secure; HttpOnly`;
  }
}
