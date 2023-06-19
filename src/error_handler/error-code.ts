export class ErrorCode {
  public static readonly Unauthorized = 'Unauthorized Access is Forbidden';
  public static readonly NotFound = 'Request is not found..';
  public static readonly AssetNotFound = 'Asset is not found';
  public static readonly BadRequestError = 'BadRequestError';
  public static readonly RequestTimeoutError = 'Request Timed Out';
  public static readonly UnknownError = 'Something went wrong..';
  public static readonly DuplicateUserError =
    'User already exist with that name';
  public static readonly NoUserFoundError = 'User Name does not exist';
  public static readonly WrongPasswordError = 'Password is not correct';
  public static readonly ServerError = 'Something wrong happened on the server';
  public static readonly NoNameOrPassword =
    'You must provide a username and password';
  public static readonly WrongRegisterPasswordError =
    'Register Password is Incorrect please contact administrator to provide you one.';
  public static readonly BodyNotJSON =
    'This request requires JSON data inside body.';
  public static readonly WrongInput = 'You sended wrong input into the body.';
}
