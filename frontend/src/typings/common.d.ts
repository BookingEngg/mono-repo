export type TRoutes = {
  path: string;
  element: JSX.Element;
  errorElement?: JSX.Element;
  children?: TRoutes[];
};
