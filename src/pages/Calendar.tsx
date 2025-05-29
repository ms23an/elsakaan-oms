
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { generateMockOrders, generateMockCustomers, Order } from '@/types';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const Calendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDayOrders, setSelectedDayOrders] = useState<Order[]>([]);
  
  // Load mock data
  React.useEffect(() => {
    const mockCustomers = generateMockCustomers(15);
    const mockOrders = generateMockOrders(mockCustomers, 40);
    setOrders(mockOrders);
    
    // Filter orders for today initially
    const todayOrders = mockOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return isToday(orderDate);
    });
    
    setSelectedDayOrders(todayOrders);
  }, []);
  
  // Get orders for a specific date
  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const ordersForDay = getOrdersForDate(selectedDate);
      setSelectedDayOrders(ordersForDay);
    }
  };
  
  // Count orders for each day to display in calendar
  const getDayOrderCount = (day: Date) => {
    const ordersForDay = getOrdersForDate(day);
    if (ordersForDay.length > 0) {
      return (
        <Badge variant="outline" className="absolute bottom-1 right-1 bg-primary/10 text-xs">
          {ordersForDay.length}
        </Badge>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">التقويم</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>التقويم</CardTitle>
            <CardDescription>عرض الطلبات حسب التاريخ</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
              components={{
                DayContent: (props) => (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {props.date.getDate()}
                    {getDayOrderCount(props.date)}
                  </div>
                )
              }}
              locale={ar}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>
              طلبات {format(date, "d MMMM yyyy", { locale: ar })}
            </CardTitle>
            <CardDescription>
              {selectedDayOrders.length > 0 
                ? `${selectedDayOrders.length} طلب لهذا اليوم` 
                : 'لا توجد طلبات لهذا اليوم'}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-auto">
            {selectedDayOrders.length > 0 ? (
              <div className="space-y-4">
                {selectedDayOrders.map(order => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          <a href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                            طلب #{order.id}
                          </a>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          العميل: {order.customerId}
                        </p>
                      </div>
                      <Badge>
                        {order.status === 'pending' && 'قيد الانتظار'}
                        {order.status === 'processing' && 'قيد التجهيز'}
                        {order.status === 'shipped' && 'تم الشحن'}
                        {order.status === 'delivered' && 'تم التسليم'}
                        {order.status === 'cancelled' && 'ملغي'}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">القيمة:</span> {order.totalAmount} ج.م
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString('ar-EG')}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">لا توجد طلبات لهذا اليوم</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
