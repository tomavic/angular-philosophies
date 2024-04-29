export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  id: number;
  customer: string;
  total: number;
  status: OrderStatus;
}

export interface Page<T> {
  items: T[];
  total: number;
}

/** Static option lists live in the model file, never behind an endpoint. */
export const ORDER_STATUS_OPTIONS: readonly OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];
