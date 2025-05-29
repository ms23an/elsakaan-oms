import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, PackageOpen, Truck, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customersAPI, ordersAPI, shipmentsAPI } from "@/services/api";
import { Customer, Order } from "@/types";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-3xl font-bold mt-2">{value}</div>
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full h-fit">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersAPI.getAll({ limit: 50 }),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersAPI.getAll({ limit: 50 }),
  });

  const { data: shipmentsData, isLoading: shipmentsLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: () => shipmentsAPI.getAll({ limit: 50 }),
  });

  const isLoading = customersLoading || ordersLoading || shipmentsLoading;

  const customers = customersData?.customers || [];
  const orders = ordersData?.orders || [];
  const shipments = shipmentsData?.shipments || [];

  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o: Order) => o.status === "pending" || o.status === "processing"
  ).length;
  const shippedOrders = orders.filter(
    (o: Order) => o.status === "shipped"
  ).length;

  const totalRevenue = orders.reduce(
    (sum: number, order: Order) => sum + (order.totalAmount || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي العملاء"
          value={totalCustomers}
          description="العدد الكلي للعملاء المسجلين"
          icon={<User className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={totalOrders}
          description="العدد الكلي للطلبات"
          icon={<Package className="h-6 w-6 text-indigo-600" />}
        />
        <StatCard
          title="طلبات قيد التنفيذ"
          value={pendingOrders}
          description="طلبات في انتظار التجهيز أو الشحن"
          icon={<PackageOpen className="h-6 w-6 text-amber-600" />}
        />
        <StatCard
          title="شحنات قيد التسليم"
          value={shippedOrders}
          description="الطلبات التي تم شحنها ولم تسلم بعد"
          icon={<Truck className="h-6 w-6 text-green-600" />}
        />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>ملخص المبيعات</CardTitle>
            <CardDescription>إجمالي المبيعات والإيرادات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRevenue} ج.م</div>
            <p className="text-sm text-muted-foreground mt-1">
              إجمالي قيمة جميع الطلبات
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order: Order) => (
                <div
                  key={order.id || order._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {(order.id || order._id)?.slice(-8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.totalAmount || 0} ج.م</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-muted-foreground">
                  لا توجد طلبات
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أحدث العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.slice(0, 5).map((customer: Customer) => (
                <div
                  key={customer.id || customer._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone1}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {customer.orders?.length || 0} طلب
                    </p>
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                <p className="text-center text-muted-foreground">
                  لا يوجد عملاء
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
