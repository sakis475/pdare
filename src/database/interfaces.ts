export enum UserType {
  OWNER = 'owner',
  WAITER = 'waiter',
  GUEST = 'guest',
}

export enum PropertyDataType {
  SINGLESELECT = 'singleselect',
  MULTISELECT = 'multiselect',
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

export type SortDirection = 'sortDown' | 'sortUp';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
