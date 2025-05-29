
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StarRating from '@/components/StarRating';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';
import AddCustomerForm from '@/components/AddCustomerForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customersAPI } from '@/services/api';
import { toast } from 'sonner';

const Customers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: () => customersAPI.getAll({ search: searchQuery, limit: 50 }),
  });

  const customers = customersData?.customers || [];

  const handleAddCustomer = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setAddCustomerOpen(false);
    toast.success('تم إضافة العميل بنجاح');
  };

  const handleCustomerClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
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
        <p className="text-muted-foreground mt-2">تعذر تحميل بيانات العملاء</p>
      </div>
    );
  }

  // Helper function to get default address
  const getDefaultAddress = (customer: any) => {
    return customer.addresses?.find((addr: any) => addr.isDefault) || customer.addresses?.[0];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">العملاء</h1>
        <Button onClick={() => setAddCustomerOpen(true)}>
          <UserPlus className="ml-2 h-4 w-4" />
          عميل جديد
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="بحث عن عميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>عدد الطلبات</TableHead>
              <TableHead>التقييم</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer: any) => (
                <TableRow 
                  key={customer._id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCustomerClick(customer._id)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone1}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {getDefaultAddress(customer)?.address}
                  </TableCell>
                  <TableCell>{customer.orders?.length || 0}</TableCell>
                  <TableCell>
                    <StarRating value={customer.rating || 5} readOnly size="sm" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  لا يوجد عملاء مطابقين للبحث
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AddCustomerForm 
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onCustomerAdded={handleAddCustomer}
      />
    </div>
  );
};

export default Customers;
