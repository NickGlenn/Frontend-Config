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