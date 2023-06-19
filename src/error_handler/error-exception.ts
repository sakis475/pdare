import { ErrorCode } from './error-code';

export class ErrorException extends Error {
  public status = 500;
  public description: string;
  constructor(code: string = ErrorCode.UnknownError) {
    super(code);

    this.description = code;
    this.status = 500;
    switch (code) {
      case ErrorCode.NoNameOrPassword:
        this.status = 404;
        break;
      case ErrorCode.BadRequestError:
        this.status = 400;
        break;
      case ErrorCode.Unauthorized:
        this.status = 401;
        break;
      case ErrorCode.NotFound:
        this.status = 404;
        break;
      case ErrorCode.AssetNotFound:
        this.status = 404;
        break;
      case ErrorCode.RequestTimeoutError:
        this.status = 408;
        break;
      case ErrorCode.DuplicateUserError:
        this.status = 405;
        break;
      case ErrorCode.NoUserFoundError:
        this.status = 405;
        break;
      case ErrorCode.WrongPasswordError:
        this.status = 401;
        break;
      case ErrorCode.ServerError:
        this.status = 500;
        break;
      case ErrorCode.WrongRegisterPasswordError:
        this.status = 401;
        break;
      case ErrorCode.WrongInput:
        this.status = 404;
        break;
      default:
        this.status = 500;
        break;
    }
  }
}
