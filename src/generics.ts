export type StringMap = {
  [key: string]: string;
};

export type TMap<T> = {
  [key: string]: T;
};

export type Primitive = null | boolean | number | string;

export type PrimitiveList = (Primitive | PrimitiveMap | PrimitiveList)[];

export type PrimitiveMap = {
  [key: string]: Primitive | PrimitiveList | PrimitiveMap;
};

export type NullableMap<T> = {
  [key in keyof T]: null | T[key];
};