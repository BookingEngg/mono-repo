export type TRoutes = {
  path: string;
  label: string;
  key: string;
  icon?: JSX.Element;
  element: JSX.Element;
  errorElement?: JSX.Element;
  children?: TRoutes[];

  //props will tell where to show the route or not
  showOnSideNav?: boolean;
  showOnTab?: boolean;
  parent?: TRoutes;
  handle?: { identifier: string };

  //roles and privileges
  accessible_roles?: string[];
};