export const freeze = <T extends object>(o: T): Readonly<T> => Object.freeze(o);
