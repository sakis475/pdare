export enum UserType {
  OWNER = "owner",
  ADMIN = "admin",
  ADMINOPERATOR = "adminOperator",
  WAITER = "waiter",
}

export enum PropertyDataType {
  SINGLESELECT = "singleselect",
  MULTISELECT = "multiselect",
}

export type createOrderRequest = {
  table: string;
  items: {
    title: string;
    itemProperties: {
      title: string;
      value: string;
    }[];
    quantity: number;
  };
};
