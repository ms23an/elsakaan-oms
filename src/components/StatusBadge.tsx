
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'قيد الانتظار',
          className: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
        };
      case 'processing':
        return { 
          label: 'قيد التجهيز',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      case 'shipped':
        return { 
          label: 'تم الشحن',
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
        };
      case 'delivered':
        return { 
          label: 'تم التسليم',
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'cancelled':
        return { 
          label: 'ملغي',
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      default:
        return { 
          label: 'غير معروف',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const { label, className } = getStatusInfo(status);

  return (
    <Badge variant="outline" className={cn(className)}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
