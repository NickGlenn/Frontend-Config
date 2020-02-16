type StringMap = {
  [key: string]: string;
};

type TMap<T> = {
  [key: string]: T;
};

type Primitive = null | boolean | number | string;

type PrimitiveList = (Primitive | PrimitiveMap | PrimitiveList)[];

type PrimitiveMap = {
  [key: string]: Primitive | PrimitiveList | PrimitiveMap;
};

type NullableMap<T> = {
  [key in keyof T]: null | T[key];
};