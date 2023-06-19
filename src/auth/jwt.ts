import jwt, { Secret } from 'jsonwebtoken';
import { ErrorException } from '../error_handler/error-exception';
import { ErrorCode } from '../error_handler/error-code';

const jwtKey = process.env.JWT_PRIVATE_KEY as Secret;

export const generateAuthToken = (user: any): string => {
  const token = jwt.sign({ _id: user._id, name: user.name }, jwtKey, {
    expiresIn: '2h'
  });
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
