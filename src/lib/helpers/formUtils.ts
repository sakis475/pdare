export function isEmailValid(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export function isPasswordValid(password: string) {
  // Check for minimum length and at least one number
  const re = /^(?=.*[0-9])(?=.{8,})/;
  return re.test(password);
}

//max -> 3 [0,1,2]
export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function getRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}
