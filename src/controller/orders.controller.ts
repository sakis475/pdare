import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { comparePassword } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserModel } from '../database/model/user.model';
import { User } from '../database/entity/User';
import { UserType } from '../database/interfaces';
// import { usersDB } from '../model/db/users.db';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json('ok');
}
