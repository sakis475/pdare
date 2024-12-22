import { ErrorModel } from './error-model';

/** App code description
 *  Code-prefix
 *
 * Server Errors (SV)
 * Authorization Errors (AU)
 * Data Errors (DT)
 * Client Errors (CL)
 * General Errors (GN)
 */

export class ErrorCode extends ErrorModel {
  public static readonly UnknownError = {
    message: 'Something went wrong..',
    appcode: 'SV01',
    code: 500,
  };

  public static readonly UnexpectedError = {
    message: "Something happened that shouldn't..",
    appcode: 'SV02',
    code: 500,
  };

  public static readonly ServerError = {
    message: 'Something wrong happened on the server',
    appcode: 'SV03',
    code: 500,
  };

  public static readonly Unauthorized: ErrorModel = {
    message: 'Unauthorized Access is Forbidden',
    appcode: 'AU01',
    code: 401,
  };

  public static readonly JWTExpired = {
    message: 'Your session has expired',
    appcode: 'AU02',
    code: 401,
  };

  public static readonly WrongPasswordError = {
    message: 'Password is not correct',
    appcode: 'AU03',
    code: 401,
  };

  public static readonly NoNameOrPassword = {
    message: 'You must provide a username/email and password',
    appcode: 'AU04',
    code: 400,
  };

  public static readonly WrongRegisterPasswordError = {
    message:
      'Register Password is Incorrect please contact the administrator to provide you one.',
    appcode: 'AU05',
    code: 400,
  };

  public static readonly UserNoRestaurant = {
    message: 'User has no restaurant.',
    appcode: 'AU06',
    code: 401,
  };

  public static readonly NoPermission = {
    message: 'No permission to do that',
    appcode: 'AU07',
    code: 401,
  };

  public static readonly NotFound = {
    message: 'Request is not found..',
    appcode: 'DT01',
    code: 404,
  };

  public static readonly AssetNotFound = {
    message: 'Asset is not found',
    appcode: 'DT02',
    code: 404,
  };

  public static readonly DuplicateUserError = {
    message: 'User already exists with that name',
    appcode: 'DT03',
    code: 409,
  };

  public static readonly NoUserFoundError = {
    message: 'User Name does not exist',
    appcode: 'DT04',
    code: 404,
  };

  public static readonly NoUserOrDisabledError = {
    message: 'User Name does not exist or disabled',
    appcode: 'DT05',
    code: 404,
  };

  public static readonly SQLDuplicate = {
    message: 'Item/s already exist.',
    appcode: 'DT06',
    code: 400,
  };

  public static readonly UserAlreadyExists = {
    message: 'User Already exist.',
    appcode: 'DT07',
    code: 400,
  };

  public static readonly RequestAlreadyExists = {
    message: 'Request already exists.',
    appcode: 'DT08',
    code: 400,
  };

  public static readonly RequestNotFound = {
    message: "Request doesn't exist.",
    appcode: 'DT09',
    code: 400,
  };

  public static readonly TableIsOccupied = {
    message: 'Table is occupied.',
    appcode: 'DT10',
    code: 400,
  };

  public static readonly TitleAlreadyExists = {
    message: 'Title already exists.',
    appcode: 'DT11',
    code: 400,
  };

  public static readonly PasswordWrongFormat = {
    message: 'Make sure password includes at least 1 number',
    appcode: 'DT12',
    code: 400,
  };

  public static readonly BadRequestError = {
    message: 'Bad Request',
    appcode: 'CL01',
    code: 400,
  };

  public static readonly RequestTimeoutError = {
    message: 'Request Timed Out',
    appcode: 'CL02',
    code: 408,
  };

  public static readonly BodyNotJSON = {
    message: 'This request requires JSON data inside the body.',
    appcode: 'CL03',
    code: 400,
  };

  public static readonly WrongInput = {
    message: 'You send incorrect data.',
    appcode: 'CL04',
    code: 400,
  };

  public static readonly ContactAdminError = {
    message: "Can't complete request please contact support.",
    appcode: 'CL05',
    code: 400,
  };

  public static readonly UpdateIsForbidden = {
    message: 'Update is forbidden.',
    appcode: 'CL06',
    code: 400,
  };
}
