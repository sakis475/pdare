import { ErrorModel } from "./error-model";

export class ErrorCode extends ErrorModel {
  public static readonly UnknownError = {
    message: "Something went wrong..",
    code: 500,
  };

  public static readonly Unauthorized: ErrorModel = {
    message: "Unauthorized Access is Forbidden",
    code: 401, // HTTP status code 401 represents "Unauthorized" error.
  };

  public static readonly JWTExpired = {
    message: "Your session has expired",
    code: 401, // HTTP status code 401 can also be used for "JWTExpired" error.
  };

  public static readonly NotFound = {
    message: "Request is not found..",
    code: 404, // HTTP status code 404 represents "Not Found" error.
  };

  public static readonly AssetNotFound = {
    message: "Asset is not found",
    code: 404, // HTTP status code 404 can also be used for "AssetNotFound" error.
  };

  public static readonly BadRequestError = {
    message: "Bad Request",
    code: 400, // HTTP status code 400 represents "Bad Request" error.
  };

  public static readonly RequestTimeoutError = {
    message: "Request Timed Out",
    code: 408, // HTTP status code 408 represents "Request Timeout" error.
  };

  public static readonly DuplicateUserError = {
    message: "User already exists with that name",
    code: 409, // HTTP status code 409 represents "Conflict" error, which can be used for "DuplicateUserError" as it indicates that there is a conflict with the current state of the resource.
  };

  public static readonly NoUserFoundError = {
    message: "User Name does not exist",
    code: 404, // HTTP status code 404 can be used for "NoUserFoundError".
  };

  public static readonly NoUserOrDisabledError = {
    message: "User Name does not exist or disabled",
    code: 404, // HTTP status code 404 can be used for "NoUserOrDisabledError".
  };

  public static readonly WrongPasswordError = {
    message: "Password is not correct",
    code: 401, // HTTP status code 401 represents "Unauthorized" error.
  };

  public static readonly ServerError = {
    message: "Something wrong happened on the server",
    code: 500, // HTTP status code 500 represents "Internal Server Error".
  };

  public static readonly NoNameOrPassword = {
    message: "You must provide a username and password",
    code: 400, // HTTP status code 400 represents "Bad Request" error.
  };

  public static readonly WrongRegisterPasswordError = {
    message:
      "Register Password is Incorrect please contact the administrator to provide you one.",
    code: 400, // HTTP status code 400 represents "Bad Request" error.
  };

  public static readonly BodyNotJSON = {
    message: "This request requires JSON data inside the body.",
    code: 400, // HTTP status code 400 represents "Bad Request" error.
  };

  public static readonly WrongInput = {
    message: "You sent the wrong input into the body.",
    code: 400, // HTTP status code 400 represents "Bad Request" error.
  };
}
