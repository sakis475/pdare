import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../database/entity/User.entity';
import dayjs from '../lib/dayjs';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { UserType } from '../database/interfaces';
import { UserService } from '../services/user.service';

const jwtKey = process.env.JWT_PRIVATE_KEY as Secret;
const jwtExpiresInMins = process.env.JWT_EXPIRATION_MINUTES;

const userService = new UserService();

export const generateAuthToken = (user: Partial<User>) => {
  const token = jwt.sign(
    {
      username: user.username,
      role: user.role,
    },
    jwtKey,
    {
      expiresIn: Number(jwtExpiresInMins) * 60,
    }
  );
  return {
    token,
    info: {
      expiresAt: dayjs()
        .add(Number(jwtExpiresInMins), 'minutes')
        .utc()
        .format(),
    },
  };
};

export const verifyToken = (token: string) => {
  const user = jwt.verify(token, jwtKey);
  return user;
};

export const prepareUserSessionBearer = async (
  user: User
): Promise<SessionBearer> => {
  const tokenJWT = generateAuthToken(user);

  console.log(tokenJWT);

  user.token = tokenJWT.token;

  const savedUser = await userService.saveUser(user);

  delete user.token;
  delete user.passwordHashed;

  return { ...tokenJWT, user };
};

export const generatePrinterAppToken = (user: Partial<User>) => {
  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    jwtKey
  );

  return token;
};

export type SessionBearer = {
  user: User;
  token: string;
  info: {
    expiresAt: string;
  };
};
