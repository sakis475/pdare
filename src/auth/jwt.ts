import jwt, { Secret } from "jsonwebtoken";
import { ErrorCode } from "../error_handler/error-code";
import { User } from "../database/entity/User.entity";
import dayjs from "../lib/dayjs";

const jwtKey = process.env.JWT_PRIVATE_KEY as Secret;
const jwtExpiresInMins = process.env.JWT_EXPIRATION_MINUTES;

export const generateAuthToken = (user: Partial<User>) => {
  const token = jwt.sign(
    {
      username: user.username,
      firstName: user.firstName,
      role: user.role,
      lastName: user.lastName,
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
        .add(Number(jwtExpiresInMins), "minutes")
        .utc()
        .format(),
    },
  };
};

export const verifyToken = (token: string) => {
  const user = jwt.verify(token, jwtKey);
  return user;
};
