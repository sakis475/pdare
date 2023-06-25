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

export const verifyToken = (token: string): { _id: string; name: string } => {
  try {
    const tokenData = jwt.verify(token, jwtKey);
    return tokenData as { _id: string; name: string };
  } catch (error) {
    throw new ErrorException(ErrorCode.Unauthorized);
  }
};
