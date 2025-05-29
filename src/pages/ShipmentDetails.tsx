
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer, Order, OrderStatus, generateMockCustomers, generateMockOrders } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Package, Truck, MapPin } from 'lucide-react';

const ShipmentDetails: React.FC = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!shipmentId) return;

    // Simulate API call to load data
    const loadData = async () => {
      try {
        // In a real app, this would be an API call to fetch order data
        const mockCustomers = generateMockCustomers(15);
        const mockOrders = generateMockOrders(mockCustomers, 40);
        
        // For this demo, we're treating orders as shipments
        const foundOrder = mockOrders.find(o => o.id === shipmentId);
        
        if (foundOrder) {
          setOrder(foundOrder);
          
          const foundCustomer = mockCustomers.find(c => c.id === foundOrder.customerId);
          if (foundCustomer) {
            setCustomer(foundCustomer);
          }
        }
      } catch (error) {
        console.error('Error loading shipment details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [shipmentId]);
  
  const handleCustomerClick = () => {
    if (customer) {
      navigate(`/customers/${customer.id}`);
    }
  };
  
  const handleOrderClick = () => {
    if (order) {
      navigate(`/orders/${order.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!order || !customer) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">الشحنة غير موجودة</h2>
        <p className="text-muted-foreground mt-2">لا يمكن العثور على بيانات هذه الشحنة</p>
        <Button className="mt-4" onClick={() => navigate('/shipments')}>
          العودة إلى قائمة الشحنات
        </Button>
      </div>
    );
  }

  return (
    <div className="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            شحنة: {order.id}
          </h1>
          <p className="text-muted-foreground">
            تاريخ الشحن: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="flex items-center">
              <User className="ml-2 h-5 w-5" />
              بيانات العميل
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCustomerClick}>
              عرض
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">اسم العميل</span>
                <span className="font-medium">{customer.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">رقم الهاتف</span>
                <span className="font-medium">{customer.phone1}</span>
              </div>
              {customer.phone2 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">رقم هاتف بديل</span>
                  <span className="font-medium">{customer.phone2}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">العنوان</span>
                <span className="font-medium text-right max-w-[70%]">
                  {customer.addresses.find(addr => addr.isDefault)?.address || customer.addresses[0]?.address}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="ml-2 h-5 w-5" />
              تفاصيل الشحنة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="font-medium ml-2">حالة الشحنة:</span>
                <StatusBadge status={order.status} />
              </div>
              <Button variant="outline" size="sm" onClick={handleOrderClick}>
                عرض الطلب
              </Button>
            </div>
            
            {order.trackingCode && (
              <div className="mb-6 p-4 border rounded-md bg-muted/30">
                <div className="flex items-center">
                  <Truck className="ml-2 h-5 w-5 text-primary" />
                  <div>
                    <span className="text-sm text-muted-foreground ml-2">رمز التتبع:</span>
                    <span className="font-medium">{order.trackingCode}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6 p-4 border rounded-md bg-muted/30">
              <div className="flex items-center mb-2">
                <MapPin className="ml-2 h-5 w-5 text-primary" />
                <span className="font-medium">عنوان التسليم:</span>
              </div>
              <p className="text-sm mr-7">
                {customer.addresses.find(addr => addr.isDefault)?.address || customer.addresses[0]?.address}
              </p>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead className="text-center">الكمية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="ml-2 h-5 w-5" />
            معلومات الشحن
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">طريقة الشحن</span>
              <span className="font-medium">توصيل سريع</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">شركة الشحن</span>
              <span className="font-medium">شركة توصيل مصر</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">تاريخ الشحن</span>
              <span className="font-medium">{new Date(order.updatedAt).toLocaleDateString('ar-EG')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">تكلفة الشحن</span>
              <span className="font-medium">{order.shippingCost} ج.م</span>
            </div>
            {order.status === 'delivered' && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">تاريخ التسليم</span>
                <span className="font-medium">{new Date().toLocaleDateString('ar-EG')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentDetails;
