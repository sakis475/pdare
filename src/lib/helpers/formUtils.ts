export function isEmailValid(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export function isPasswordValid(password: string) {
  // Check for minimum length and at least one number
  const re = /^(?=.*[0-9])(?=.{8,})/;
  return re.test(password);
}
