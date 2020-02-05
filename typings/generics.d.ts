type StringMap = {
  [key: string]: string;
};

type TMap<T> = {
  [key: string]: T;
};

type Primitive = null | boolean | number | string;