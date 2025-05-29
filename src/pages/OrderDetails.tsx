import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer, Order, OrderComment, OrderStatus, generateMockCustomers, generateMockOrders } from '@/types';
import StarRating from '@/components/StarRating';
import StatusBadge from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Edit, MessageSquare, Package, Truck, User, Star } from 'lucide-react';
import { Label } from '@/components/ui/label';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [trackingCode, setTrackingCode] = useState('');
  const [isStatusEditing, setIsStatusEditing] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) return;

    // Simulate API call to load data
    const loadData = async () => {
      try {
        // In a real app, this would be an API call to fetch order data
        const mockCustomers = generateMockCustomers(15);
        const mockOrders = generateMockOrders(mockCustomers, 40);
        
        const foundOrder = mockOrders.find(o => o.id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
          setSelectedStatus(foundOrder.status);
          setTrackingCode(foundOrder.trackingCode || '');
          
          const foundCustomer = mockCustomers.find(c => c.id === foundOrder.customerId);
          if (foundCustomer) {
            setCustomer(foundCustomer);
          }
        }
      } catch (error) {
        console.error('Error loading order details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [orderId]);
  
  const handleAddComment = () => {
    if (!order || !newComment.trim()) return;
    
    const comment: OrderComment = {
      id: `comment-${Date.now()}`,
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };
    
    // In a real app, this would be an API call to add a comment
    setOrder({
      ...order,
      comments: [...order.comments, comment]
    });
    
    setNewComment('');
    toast.success('تمت إضافة الملاحظة بنجاح');
  };
  
  const handleUpdateRating = (rating: number) => {
    if (!order) return;
    
    setNewRating(rating);
    
    // In a real app, this would be an API call to update the rating
    setOrder({
      ...order,
      rating
    });
    
    toast.success('تم تحديث التقييم بنجاح');
  };
  
  const handleUpdateStatus = () => {
    if (!order) return;
    
    // In a real app, this would be an API call to update the status
    setOrder({
      ...order,
      status: selectedStatus,
      trackingCode: trackingCode || order.trackingCode
    });
    
    setIsStatusEditing(false);
    toast.success('تم تحديث حالة الطلب بنجاح');
  };
  
  const handleCustomerClick = () => {
    if (customer) {
      navigate(`/customers/${customer.id}`);
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
        <h2 className="text-2xl font-bold">الطلب غير موجود</h2>
        <p className="text-muted-foreground mt-2">لا يمكن العثور على بيانات هذا الطلب</p>
        <Button className="mt-4" onClick={() => navigate('/orders')}>
          العودة إلى قائمة الطلبات
        </Button>
      </div>
    );
  }

  return (
    <div className="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            طلب: {order.id}
          </h1>
          <p className="text-muted-foreground">
            تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
        
        {isAdmin() && !isStatusEditing && (
          <Button variant="outline" onClick={() => setIsStatusEditing(true)}>
            <Edit className="ml-2 h-4 w-4" />
            تعديل حالة الطلب
          </Button>
        )}
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">تقييم العميل</span>
                <StarRating value={customer.rating} readOnly size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="ml-2 h-5 w-5" />
              تفاصيل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="font-medium ml-2">حالة الطلب:</span>
                {isStatusEditing ? (
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="اختر حالة الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="processing">قيد التجهيز</SelectItem>
                      <SelectItem value="shipped">تم الشحن</SelectItem>
                      <SelectItem value="delivered">تم التسليم</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={order.status} />
                )}
              </div>
              {isStatusEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsStatusEditing(false)}>
                    إلغاء
                  </Button>
                  <Button size="sm" onClick={handleUpdateStatus}>
                    تحديث
                  </Button>
                </div>
              )}
            </div>
            
            {isStatusEditing && (selectedStatus === 'shipped' || selectedStatus === 'delivered') && (
              <div className="mb-4">
                <Label htmlFor="tracking">رمز التتبع</Label>
                <div className="flex gap-2">
                  <Input 
                    id="tracking"
                    placeholder="أدخل رمز التتبع" 
                    value={trackingCode} 
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {order.trackingCode && !isStatusEditing && (
              <div className="mb-4 flex items-center">
                <Truck className="ml-2 h-5 w-5 text-primary" />
                <div>
                  <span className="text-sm text-muted-foreground">رمز التتبع:</span>
                  <span className="font-medium mr-2">{order.trackingCode}</span>
                </div>
              </div>
            )}
            
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead className="text-center">الكمية</TableHead>
                    <TableHead className="text-center">السعر</TableHead>
                    <TableHead className="text-center">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">{item.price} ج.م</TableCell>
                      <TableCell className="text-center">{item.price * item.quantity} ج.م</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell className="font-medium">قيمة المنتجات</TableCell>
                    <TableCell className="text-center font-medium">{order.totalPrice} ج.م</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell className="font-medium">الشحن</TableCell>
                    <TableCell className="text-center font-medium">{order.shippingCost} ج.م</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell className="font-bold text-lg">إجمالي</TableCell>
                    <TableCell className="text-center font-bold text-lg">{order.totalAmount} ج.م</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="ml-2 h-5 w-5" />
              ملاحظات الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.comments.length > 0 ? (
                order.comments.map(comment => (
                  <div key={comment.id} className="border p-4 rounded-lg">
                    <p>{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(comment.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">لا توجد ملاحظات على هذا الطلب</p>
              )}
              
              <div className="border-t pt-4 mt-4">
                <Textarea
                  placeholder="أضف ملاحظة على الطلب..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  إضافة ملاحظة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="ml-2 h-5 w-5" />
              تقييم الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-muted-foreground">التقييم الحالي</p>
              <StarRating 
                value={order.rating} 
                onChange={handleUpdateRating}
                size="lg"
              />
              <p className="text-sm text-muted-foreground">
                اضغط على النجوم لتغيير التقييم
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails;
