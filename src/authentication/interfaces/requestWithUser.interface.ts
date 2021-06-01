import { Request } from 'express';
import User from '../../users/entities/user.entity';

/* Passport.js extends request by attaching user param with it */
interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
