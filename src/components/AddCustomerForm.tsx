
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash, Plus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Address } from '@/types';

// تعديل نوع البيانات لدعم العناوين المتعددة
const formSchema = z.object({
  name: z.string().min(2, { message: 'يجب أن يتكون الاسم من حرفين على الأقل' }),
  phone1: z.string().min(11, { message: 'يجب أن يتكون رقم الهاتف من 11 رقم على الأقل' }),
  phone2: z.string().optional(),
  // لن نقوم بتضمين العناوين في نموذج Zod، سنتعامل معها بشكل منفصل
});

type FormValues = z.infer<typeof formSchema>;

interface AddCustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: (customer: any) => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ open, onOpenChange, onCustomerAdded }) => {
  // إضافة حالة للعناوين
  const [addresses, setAddresses] = useState<Address[]>([
    { id: `addr-${Date.now()}-1`, title: 'المنزل', address: '', isDefault: true }
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone1: '',
      phone2: '',
    },
  });

  // إضافة عنوان جديد
  const addNewAddress = () => {
    setAddresses([...addresses, {
      id: `addr-${Date.now()}-${addresses.length + 1}`,
      title: '',
      address: '',
      isDefault: addresses.length === 0
    }]);
  };

  // حذف عنوان
  const removeAddress = (id: string) => {
    if (addresses.length <= 1) {
      toast.error('يجب إضافة عنوان واحد على الأقل');
      return;
    }
    
    const newAddresses = addresses.filter(addr => addr.id !== id);
    
    // إذا تم حذف العنوان الافتراضي، يجب تعيين عنوان آخر كافتراضي
    if (addresses.find(addr => addr.id === id)?.isDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }
    
    setAddresses(newAddresses);
  };

  // تعيين العنوان الافتراضي
  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  // تحديث عنوان
  const updateAddress = (id: string, field: keyof Address, value: string) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  // التحقق من صحة العناوين
  const validateAddresses = () => {
    for (const address of addresses) {
      if (!address.title.trim()) {
        toast.error('يجب إضافة وصف لكل عنوان');
        return false;
      }
      if (!address.address.trim() || address.address.trim().length < 5) {
        toast.error('يجب أن يتكون العنوان من 5 أحرف على الأقل');
        return false;
      }
    }
    return true;
  };

  const onSubmit = (data: FormValues) => {
    if (!validateAddresses()) return;
    
    try {
      // In a real app, this would be an API call to save the customer
      const newCustomer = {
        id: `cust-${Date.now()}`,
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2 || undefined,
        addresses: addresses,
        rating: 0,
        orders: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      onCustomerAdded(newCustomer);
      form.reset();
      setAddresses([{ id: `addr-${Date.now()}-1`, title: 'المنزل', address: '', isDefault: true }]);
      onOpenChange(false);
      toast.success('تم إضافة العميل بنجاح');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('حدث خطأ أثناء إضافة العميل');
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setAddresses([{ id: `addr-${Date.now()}-1`, title: 'المنزل', address: '', isDefault: true }]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة عميل جديد</DialogTitle>
          <DialogDescription>أدخل بيانات العميل والعناوين</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العميل</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل اسم العميل" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف (الأساسي)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل رقم الهاتف" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف (البديل)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل رقم هاتف بديل (اختياري)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">العناوين</h3>
                <Button type="button" variant="outline" size="sm" onClick={addNewAddress}>
                  <Plus className="ml-1 h-4 w-4" />
                  إضافة عنوان
                </Button>
              </div>
              
              {addresses.map((address, index) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">عنوان {index + 1}</h4>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          تعيين كافتراضي
                        </Button>
                      )}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeAddress(address.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <FormLabel htmlFor={`address-title-${address.id}`}>وصف العنوان</FormLabel>
                      <Input
                        id={`address-title-${address.id}`}
                        value={address.title}
                        onChange={(e) => updateAddress(address.id, 'title', e.target.value)}
                        placeholder="مثال: المنزل، العمل، إلخ"
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor={`address-text-${address.id}`}>العنوان</FormLabel>
                      <Input
                        id={`address-text-${address.id}`}
                        value={address.address}
                        onChange={(e) => updateAddress(address.id, 'address', e.target.value)}
                        placeholder="أدخل العنوان التفصيلي"
                      />
                    </div>
                    
                    {address.isDefault && (
                      <div className="text-xs text-muted-foreground bg-primary/10 p-2 rounded-md">
                        هذا هو العنوان الافتراضي
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter className="mt-6 gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit">إضافة العميل</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerForm;
