
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shipmentsAPI } from '@/services/api';

const Shipments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: shipmentsData, isLoading, error } = useQuery({
    queryKey: ['shipments', searchQuery],
    queryFn: () => shipmentsAPI.getAll({ search: searchQuery, limit: 50 }),
  });

  const shipments = shipmentsData?.shipments || [];

  const handleShipmentClick = (shipmentId: string) => {
    navigate(`/shipments/${shipmentId}`);
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
        <p className="text-muted-foreground mt-2">تعذر تحميل بيانات الشحنات</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الشحنات</h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="بحث عن شحنة..."
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
              <TableHead>رقم الطلب</TableHead>
              <TableHead>اسم العميل</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>حالة الشحن</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length > 0 ? (
              shipments.map((shipment: any) => (
                <TableRow 
                  key={shipment._id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleShipmentClick(shipment._id)}
                >
                  <TableCell className="font-medium">{shipment._id.slice(-8)}</TableCell>
                  <TableCell>{shipment.customerId?.name}</TableCell>
                  <TableCell>{shipment.customerId?.phone1}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {shipment.customerId?.addresses?.find((addr: any) => addr.isDefault)?.address || 
                     shipment.customerId?.addresses?.[0]?.address}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shipment.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status === 'shipped' ? 'تم الشحن' : 
                       shipment.status === 'delivered' ? 'تم التسليم' : shipment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  لا يوجد شحنات مطابقة للبحث
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Shipments;
