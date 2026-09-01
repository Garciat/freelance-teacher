export type MaybeProp<Name extends string, T> = [T] extends [undefined]
  ? { [K in Name]?: T }
  : { [K in Name]: T };
