
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer, Order, Address, generateMockCustomers, generateMockOrders } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Plus, Trash, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const CustomerDetails: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Editable customer data state
  const [editableCustomer, setEditableCustomer] = useState<Partial<Customer>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (!customerId) return;

    // Simulate API call to load data
    const loadData = async () => {
      try {
        // In a real app, this would be an API call to fetch customer data
        const mockCustomers = generateMockCustomers(15);
        const mockOrders = generateMockOrders(mockCustomers, 40);
        
        const foundCustomer = mockCustomers.find(c => c.id === customerId);
        const customerOrders = mockOrders.filter(o => o.customerId === customerId);
        
        if (foundCustomer) {
          setCustomer(foundCustomer);
          setEditableCustomer(foundCustomer);
          setAddresses(foundCustomer.addresses || []);
          setOrders(customerOrders);
        }
      } catch (error) {
        console.error('Error loading customer details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [customerId]);
  
  const handleSaveChanges = () => {
    if (!customer || !editableCustomer) return;
    
    // تحقق من البيانات
    if (!editableCustomer.name || editableCustomer.name.length < 2) {
      toast.error("يجب إدخال اسم العميل بشكل صحيح");
      return;
    }
    
    if (!editableCustomer.phone1 || editableCustomer.phone1.length < 11) {
      toast.error("يجب إدخال رقم هاتف صحيح");
      return;
    }
    
    // التحقق من العناوين
    if (!addresses.length) {
      toast.error("يجب إضافة عنوان واحد على الأقل");
      return;
    }
    
    for (const address of addresses) {
      if (!address.title || address.title.trim().length < 2) {
        toast.error("يجب إدخال وصف لكل عنوان");
        return;
      }
      if (!address.address || address.address.trim().length < 5) {
        toast.error("يجب إدخال تفاصيل العنوان بشكل صحيح");
        return;
      }
    }
    
    // التحقق من وجود عنوان افتراضي واحد
    const hasDefaultAddress = addresses.some(addr => addr.isDefault);
    if (!hasDefaultAddress && addresses.length > 0) {
      addresses[0].isDefault = true;
    }
    
    // In a real app, this would be an API call to update the customer
    setCustomer({
      ...customer,
      ...editableCustomer,
      addresses: [...addresses]
    });
    
    setIsEditing(false);
    toast.success("تم حفظ بيانات العميل بنجاح");
  };
  
  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleAddAddress = () => {
    setAddresses([...addresses, {
      id: `addr-${Date.now()}`,
      title: '',
      address: '',
      isDefault: addresses.length === 0
    }]);
  };

  const handleRemoveAddress = (id: string) => {
    if (addresses.length <= 1) {
      toast.error("يجب الاحتفاظ بعنوان واحد على الأقل");
      return;
    }
    
    const newAddresses = addresses.filter(addr => addr.id !== id);
    
    // إذا تم حذف العنوان الافتراضي، يجب تعيين عنوان آخر كافتراضي
    if (addresses.find(addr => addr.id === id)?.isDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }
    
    setAddresses(newAddresses);
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleUpdateAddress = (id: string, field: keyof Address, value: string) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">العميل غير موجود</h2>
        <p className="text-muted-foreground mt-2">لا يمكن العثور على بيانات هذا العميل</p>
        <Button className="mt-4" onClick={() => navigate('/customers')}>
          العودة إلى قائمة العملاء
        </Button>
      </div>
    );
  }

  const getDefaultAddress = () => {
    return customer.addresses?.find(addr => addr.isDefault) || customer.addresses?.[0];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {customer.name}
        </h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveChanges}>
                حفظ التغييرات
              </Button>
            </>
          ) : (
            isAdmin() && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </Button>
            )
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="info">البيانات الأساسية</TabsTrigger>
          <TabsTrigger value="addresses">العناوين</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="ml-2 h-5 w-5" />
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">اسم العميل</Label>
                    <Input 
                      id="name" 
                      value={editableCustomer.name || ''} 
                      onChange={(e) => setEditableCustomer({...editableCustomer, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone1">رقم الهاتف الأساسي</Label>
                    <Input 
                      id="phone1" 
                      value={editableCustomer.phone1 || ''} 
                      onChange={(e) => setEditableCustomer({...editableCustomer, phone1: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone2">رقم الهاتف البديل</Label>
                    <Input 
                      id="phone2" 
                      value={editableCustomer.phone2 || ''} 
                      onChange={(e) => setEditableCustomer({...editableCustomer, phone2: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">اسم العميل</span>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">رقم الهاتف الأساسي</span>
                    <span className="font-medium">{customer.phone1}</span>
                  </div>
                  {customer.phone2 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">رقم الهاتف البديل</span>
                      <span className="font-medium">{customer.phone2}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">تقييم العميل</span>
                    <StarRating value={customer.rating} readOnly size="sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">عدد الطلبات</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">تاريخ التسجيل</span>
                    <span className="font-medium">
                      {new Date(customer.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="ml-2 h-5 w-5" />
                  عناوين العميل
                </div>
                {isEditing && (
                  <Button size="sm" onClick={handleAddAddress}>
                    <Plus className="ml-1 h-4 w-4" />
                    إضافة عنوان
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      {isEditing ? (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <Label htmlFor={`address-title-${address.id}`}>وصف العنوان</Label>
                            <div className="flex gap-2">
                              {!address.isDefault && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                  تعيين كافتراضي
                                </Button>
                              )}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveAddress(address.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Input
                                id={`address-title-${address.id}`}
                                value={address.title}
                                onChange={(e) => handleUpdateAddress(address.id, 'title', e.target.value)}
                                placeholder="مثال: المنزل، العمل، إلخ"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`address-text-${address.id}`}>العنوان</Label>
                              <Input
                                id={`address-text-${address.id}`}
                                value={address.address}
                                onChange={(e) => handleUpdateAddress(address.id, 'address', e.target.value)}
                                placeholder="أدخل العنوان التفصيلي"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{address.title}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">افتراضي</span>
                            )}
                          </div>
                          <div className="text-sm">{address.address}</div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد عناوين مسجلة لهذا العميل
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>طلبات العميل</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div 
                      key={order.id} 
                      className="border p-4 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleOrderClick(order.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{order.id}</div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                        <span className="font-medium">{order.totalAmount} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} منتج
                        </div>
                        <StarRating value={order.rating} readOnly size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات لهذا العميل
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
