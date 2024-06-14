type Add<T> = (a: T, b: T) => T;

export const add: Add<number> = (a, b) => {
  return a + b;
};
