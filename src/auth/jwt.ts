import jwt, { Secret } from 'jsonwebtoken';
import { ErrorCode } from '../error_handler/error-code';
import { User } from '../database/entity/User.entity';

const jwtKey = process.env.JWT_PRIVATE_KEY as Secret;

export const generateAuthToken = (user: Partial<User>): string => {
  const token = jwt.sign(
    {
      username: user.username,
      firstName: user.firstName,
      role: user.role,
      lastName: user.lastName
    },
    jwtKey,
    {
      expiresIn: '12h'
    }
  );
  return token;
};

export const verifyToken = (token: string) => {
  const user = jwt.verify(token, jwtKey);
  return user;
};
