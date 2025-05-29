
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Address, Customer, OrderItem, generateMockCustomers } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { User, Package, Plus, Trash, UserPlus, MapPin } from 'lucide-react';
import AddCustomerForm from '@/components/AddCustomerForm';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// مكون فرعي لإضافة عنوان جديد
interface AddNewAddressProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressAdded: (address: Address) => void;
  existingAddresses: Address[];
}

const AddNewAddress: React.FC<AddNewAddressProps> = ({ open, onOpenChange, onAddressAdded, existingAddresses }) => {
  const [title, setTitle] = useState('');
  const [addressText, setAddressText] = useState('');
  const [isDefault, setIsDefault] = useState(existingAddresses.length === 0);

  const handleSubmit = () => {
    if (!title.trim() || title.trim().length < 2) {
      toast.error('يجب إدخال وصف للعنوان');
      return;
    }

    if (!addressText.trim() || addressText.trim().length < 5) {
      toast.error('يجب إدخال العنوان بالتفصيل (5 أحرف على الأقل)');
      return;
    }

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      title: title.trim(),
      address: addressText.trim(),
      isDefault
    };

    onAddressAdded(newAddress);
    setTitle('');
    setAddressText('');
    setIsDefault(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة عنوان جديد</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="address-title">وصف العنوان</Label>
            <Input
              id="address-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: المنزل، العمل، إلخ"
            />
          </div>
          <div>
            <Label htmlFor="address-text">العنوان</Label>
            <Textarea
              id="address-text"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="أدخل العنوان التفصيلي"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-default"
              className="ml-2"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <Label htmlFor="is-default">تعيين كعنوان افتراضي</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit}>
            إضافة العنوان
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NewOrder: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: 1, price: 0 }
  ]);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call to load customers
    const loadCustomers = async () => {
      try {
        // In a real app, this would be an API call to fetch customers
        const mockCustomers = generateMockCustomers(15);
        setCustomers(mockCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('حدث خطأ أثناء تحميل بيانات العملاء');
      }
    };
    
    loadCustomers();
  }, []);
  
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId) || null;
      setSelectedCustomer(customer);
      
      if (customer && customer.addresses.length > 0) {
        // اختيار العنوان الافتراضي أو الأول إذا لم يوجد
        const defaultAddress = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId('');
      }
    } else {
      setSelectedCustomer(null);
      setSelectedAddressId('');
    }
  }, [selectedCustomerId, customers]);
  
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prevCustomers => {
      const updatedCustomers = [...prevCustomers, newCustomer];
      setSelectedCustomerId(newCustomer.id);
      return updatedCustomers;
    });
  };
  
  const handleAddNewAddress = (newAddress: Address) => {
    if (!selectedCustomer) return;
    
    // إذا كان العنوان الجديد افتراضياً، نلغي الافتراضي من جميع العناوين الأخرى
    let updatedAddresses: Address[] = [];
    if (newAddress.isDefault) {
      updatedAddresses = selectedCustomer.addresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    } else {
      updatedAddresses = [...selectedCustomer.addresses];
    }
    
    updatedAddresses.push(newAddress);
    
    const updatedCustomer = {
      ...selectedCustomer,
      addresses: updatedAddresses
    };
    
    // تحديث قائمة العملاء
    setCustomers(prevCustomers => 
      prevCustomers.map(cust => 
        cust.id === selectedCustomerId ? updatedCustomer : cust
      )
    );
    
    // اختيار العنوان الجديد
    setSelectedAddressId(newAddress.id);
    
    toast.success('تم إضافة العنوان بنجاح');
  };
  
  const handleItemChange = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, [field]: field === 'quantity' || field === 'price' ? Number(value) : value }
          : item
      )
    );
  };
  
  const addItem = () => {
    const newItemId = String(items.length + 1);
    setItems([...items, { id: newItemId, name: '', quantity: 1, price: 0 }]);
  };
  
  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast.error('يجب أن يحتوي الطلب على منتج واحد على الأقل');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateGrandTotal = () => {
    return calculateTotal() + shippingCost;
  };
  
  const validateForm = () => {
    if (!selectedCustomerId) {
      toast.error('يرجى اختيار عميل');
      return false;
    }
    
    if (!selectedAddressId) {
      toast.error('يرجى اختيار عنوان للتوصيل');
      return false;
    }
    
    for (const item of items) {
      if (!item.name) {
        toast.error('يرجى إدخال اسم لكل منتج');
        return false;
      }
      if (item.quantity <= 0) {
        toast.error('يجب أن تكون الكمية أكبر من صفر');
        return false;
      }
      if (item.price <= 0) {
        toast.error('يجب أن يكون السعر أكبر من صفر');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // In a real app, this would send the order to an API
    toast.success('تم إنشاء الطلب بنجاح');
    navigate('/orders');
  };

  const getSelectedAddress = () => {
    if (!selectedCustomer) return null;
    return selectedCustomer.addresses.find(addr => addr.id === selectedAddressId) || null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إنشاء طلب جديد</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="ml-2 h-5 w-5" />
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">اختر العميل</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر عميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCustomer && (
                  <div>
                    <Label>بيانات العميل</Label>
                    <div className="border p-4 rounded-lg mt-2">
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm mt-1">{selectedCustomer.phone1}</p>
                      {selectedCustomer.phone2 && <p className="text-sm">{selectedCustomer.phone2}</p>}
                    </div>
                  </div>
                )}
                
                <div>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setAddCustomerOpen(true)}>
                    <UserPlus className="ml-2 h-4 w-4" />
                    عميل جديد
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedCustomer && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="ml-2 h-5 w-5" />
                    عنوان التوصيل
                  </div>
                  <Button type="button" size="sm" onClick={() => setAddAddressOpen(true)}>
                    <Plus className="ml-1 h-4 w-4" />
                    إضافة عنوان
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer.addresses.length > 0 ? (
                  <div className="space-y-4">
                    <RadioGroup 
                      value={selectedAddressId} 
                      onValueChange={setSelectedAddressId}
                      className="space-y-4"
                    >
                      {selectedCustomer.addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-2 border p-4 rounded-lg">
                          <RadioGroupItem value={address.id} id={`address-${address.id}`} className="ml-2" />
                          <div className="flex-1">
                            <Label htmlFor={`address-${address.id}`} className="font-medium block mb-1">
                              {address.title}
                              {address.isDefault && (
                                <span className="mr-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  افتراضي
                                </span>
                              )}
                            </Label>
                            <p className="text-sm text-muted-foreground">{address.address}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">لا توجد عناوين مسجلة لهذا العميل</p>
                    <Button type="button" variant="outline" className="mt-2" onClick={() => setAddAddressOpen(true)}>
                      إضافة عنوان جديد
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="ml-2 h-5 w-5" />
                  المنتجات
                </div>
                <Button type="button" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة منتج
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label htmlFor={`item-name-${item.id}`}>اسم المنتج</Label>
                      <Input
                        id={`item-name-${item.id}`}
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-quantity-${item.id}`}>الكمية</Label>
                      <Input
                        id={`item-quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`item-price-${item.id}`}>السعر (ج.م)</Label>
                      <Input
                        id={`item-price-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span>إجمالي المنتجات:</span>
                    <span className="font-medium">{calculateTotal()} ج.م</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="w-64">
                      <Label htmlFor="shipping">تكلفة الشحن (ج.م)</Label>
                      <Input
                        id="shipping"
                        type="number"
                        min="0"
                        step="0.01"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-lg font-bold">
                        الإجمالي: {calculateGrandTotal()} ج.م
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ملاحظات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="أدخل أي ملاحظات إضافية على الطلب هنا..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
            إلغاء
          </Button>
          <Button type="submit">
            إنشاء الطلب
          </Button>
        </div>
      </form>
      
      <AddCustomerForm 
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onCustomerAdded={handleAddCustomer}
      />
      
      {selectedCustomer && (
        <AddNewAddress 
          open={addAddressOpen}
          onOpenChange={setAddAddressOpen}
          onAddressAdded={handleAddNewAddress}
          existingAddresses={selectedCustomer.addresses}
        />
      )}
    </div>
  );
};

export default NewOrder;
