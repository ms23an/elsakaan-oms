
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StarRating from '@/components/StarRating';
import { PackageOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '@/services/api';

const Orders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['orders', searchQuery, statusFilter],
    queryFn: () => ordersAPI.getAll({ 
      search: searchQuery, 
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: 50 
    }),
  });

  const orders = ordersData?.orders || [];

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  
  const getCustomerName = (order: any) => {
    return order.customerId?.name || 'عميل غير معروف';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600">خطأ في تحميل البيانات</h2>
        <p className="text-muted-foreground mt-2">تعذر تحميل بيانات الطلبات</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الطلبات</h1>
        <Button onClick={() => navigate('/new-order')}>
          <PackageOpen className="mr-2 h-4 w-4" />
          طلب جديد
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="بحث عن طلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select 
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الطلبات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">قيد التجهيز</SelectItem>
                <SelectItem value="shipped">تم الشحن</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التقييم</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order: any) => (
                <TableRow 
                  key={order._id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleOrderClick(order._id)}
                >
                  <TableCell className="font-medium">{order._id.slice(-8)}</TableCell>
                  <TableCell>{getCustomerName(order)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>{order.totalAmount} ج.م</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <StarRating value={order.rating || 5} readOnly size="sm" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  لا توجد طلبات مطابقة للبحث
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;
