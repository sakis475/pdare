import { ErrorCode } from "./error-code";

export class ErrorException extends ErrorCode {
  public message = "UNKNOWN";
  public code = 500;

  constructor(errorCode: ErrorCode) {
    super();

    this.message = errorCode.message;
    this.appcode = errorCode.appcode;
    this.code = errorCode.code;
  }
}
