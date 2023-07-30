import { NextFunction, Request, Response } from "express";
import { ErrorCode } from "../error_handler/error-code";
import { comparePassword, passwordHash } from "../auth/password-hash";
import { generateAuthToken } from "../auth/jwt";
import { UserModel } from "../database/model/user.model";
import { ErrorException } from "../error_handler/error-exception";

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function postRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, firstName, lastName, password } = req.body;

  if (!username || !password || !firstName || !lastName) {
    return next(new ErrorException(ErrorCode.NoNameOrPassword));
  }
  const userModel = new UserModel();

  const passwordHashed = passwordHash(password);

  const newUserData = { username, firstName, lastName, passwordHashed };

  const token = generateAuthToken(newUserData);

  const newuser = await userModel.saveUser({
    ...newUserData,
    token,
  });

  delete newuser["passwordHashed"];

  res.json(generateAuthToken(newuser));
}
