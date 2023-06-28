import jwt, { Secret } from 'jsonwebtoken';
import { ErrorException } from '../error_handler/error-exception';
import { ErrorCode } from '../error_handler/error-code';
import { User } from 'src/database/entity/User';

const jwtKey = process.env.JWT_PRIVATE_KEY as Secret;

export const generateAuthToken = (user: Partial<User>): string => {
  const token = jwt.sign(
    { username: user.username, lastName: user.lastName },
    jwtKey,
    {
      expiresIn: '1h'
    }
  );
  return token;
};

export const verifyToken = (token: string) => {
  try {
    jwt.verify(token, jwtKey);
  } catch (error) {
    throw new ErrorException(ErrorCode.Unauthorized);
  }
};
