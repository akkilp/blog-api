import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import User from 'src/users/entities/user.entity';
import { AuthenticationService } from '../authentication.service';

/* Local strategy attaches user to request param 
  http://www.passportjs.org/docs/authenticate/
*/
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authenticationService: AuthenticationService) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string): Promise<User> {
    return this.authenticationService.getAuthenticatedUser(email, password);
  }
}
