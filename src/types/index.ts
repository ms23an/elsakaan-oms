// Order status types
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

// Address type
export interface Address {
  id: string;
  title: string; // وصف العنوان مثل "المنزل"، "العمل"، إلخ
  address: string;
  isDefault?: boolean;
}

// Customer type
export interface Customer {
  id: string;
  _id?: string;
  name: string;
  phone1: string;
  phone2?: string;
  addresses: Address[]; // تغيير من عنوان واحد إلى قائمة من العناوين
  rating: number; // Average rating of all customer's orders
  orders: string[]; // Array of order IDs
  createdAt: string;
  updatedAt: string;
}

// Order type
export interface Order {
  id: string;
  _id?: string;
  customerId: string;
  items: OrderItem[];
  totalPrice: number;
  shippingCost: number;
  totalAmount: number; // totalPrice + shippingCost
  status: OrderStatus;
  trackingCode?: string;
  rating: number; // 1-5 star rating
  comments: OrderComment[];
  createdAt: string;
  updatedAt: string;
}

// Order item
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Order comment
export interface OrderComment {
  id: string;
  text: string;
  createdAt: string;
}

// Mock data generator functions
export const generateMockCustomers = (count: number = 10): Customer[] => {
  const customers: Customer[] = [];

  for (let i = 1; i <= count; i++) {
    customers.push({
      id: `cust-${i}`,
      name: `عميل ${i}`,
      phone1: `01${Math.floor(Math.random() * 10000000000)}`.substring(0, 11),
      phone2:
        Math.random() > 0.5
          ? `01${Math.floor(Math.random() * 10000000000)}`.substring(0, 11)
          : undefined,
      addresses: [
        {
          id: `addr-${i}-1`,
          title: "المنزل",
          address: `عنوان المنزل ${i}، المنطقة ${i}، المدينة`,
          isDefault: true,
        },
        ...(Math.random() > 0.5
          ? [
              {
                id: `addr-${i}-2`,
                title: "العمل",
                address: `عنوان العمل ${i}، المنطقة ${
                  Math.floor(Math.random() * 10) + 1
                }، المدينة`,
                isDefault: false,
              },
            ]
          : []),
      ],
      rating: Math.floor(Math.random() * 5) + 1,
      orders: [],
      createdAt: new Date(
        Date.now() - Math.random() * 10000000000
      ).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return customers;
};

export const generateMockOrders = (
  customers: Customer[],
  count: number = 30
): Order[] => {
  const statuses: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const items = [
    "قميص رجالي",
    "بنطلون جينز",
    "تيشرت قطني",
    "بلوزة نسائية",
    "فستان صيفي",
    "جاكيت شتوي",
    "بلوفر صوف",
    "بدلة رسمية",
    "حذاء رياضي",
    "حقيبة يد",
  ];

  const orders: Order[] = [];

  for (let i = 1; i <= count; i++) {
    const customerId =
      customers[Math.floor(Math.random() * customers.length)].id;
    const orderItems: OrderItem[] = [];
    const itemCount = Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < itemCount; j++) {
      orderItems.push({
        id: `item-${i}-${j}`,
        name: items[Math.floor(Math.random() * items.length)],
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 500) + 100,
      });
    }

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = Math.floor(Math.random() * 100) + 50;
    const rating = Math.floor(Math.random() * 5) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const comments: OrderComment[] = [];
    const commentCount = Math.floor(Math.random() * 2);

    for (let k = 0; k < commentCount; k++) {
      comments.push({
        id: `comment-${i}-${k}`,
        text: `ملاحظة على الطلب رقم ${k + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 1000000).toISOString(),
      });
    }

    const order: Order = {
      id: `ord-${i}`,
      customerId,
      items: orderItems,
      totalPrice,
      shippingCost,
      totalAmount: totalPrice + shippingCost,
      status,
      trackingCode:
        status !== "pending"
          ? `TRK${Math.floor(Math.random() * 10000)}`
          : undefined,
      rating,
      comments,
      createdAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(order);

    // Update customer orders
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      customer.orders.push(order.id);
    }
  }

  // Update customer ratings based on their orders
  customers.forEach((customer) => {
    const customerOrders = orders.filter(
      (order) => order.customerId === customer.id
    );
    if (customerOrders.length > 0) {
      const totalRating = customerOrders.reduce(
        (sum, order) => sum + order.rating,
        0
      );
      customer.rating = Math.round(totalRating / customerOrders.length);
    }
  });

  return orders;
};
