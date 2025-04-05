import React, { useState } from 'react';
import { Select, Button } from '@windmill/react-ui';
import { FiSave } from 'react-icons/fi';
import { BiLoaderAlt } from 'react-icons/bi';

import OrderServices from '@/services/OrderServices';
import { notifyError, notifySuccess } from "@/utils/toast";

const OrderStatusSelect = ({ orderId, currentStatus, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || '');

  // Các trạng thái đơn hàng có thể chọn
  const statuses = [
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'OUT_FOR_DELIVERY', label: 'Chờ giao hàng' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Đã hủy' }
  ];

  // Xử lý khi thay đổi trạng thái
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Xử lý khi cập nhật trạng thái
  const handleSubmit = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) return;

    try {
      setLoading(true);
      
      const response = await OrderServices.updateOrderStatus(orderId, selectedStatus);
      
      if (response.success) {
        notifySuccess("Cập nhật trạng thái đơn hàng thành công!");
        
        // Gọi callback để cập nhật lại dữ liệu
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        notifyError("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      notifyError("Đã xảy ra lỗi khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  // Xác định màu của option dựa trên giá trị trạng thái
  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED':
        return 'text-green-600 font-medium';
      case 'CANCELLED':
        return 'text-red-600 font-medium';
      case 'PAID':
        return 'text-blue-600 font-medium';
      case 'OUT_FOR_DELIVERY':
        return 'text-yellow-600 font-medium';
      default:
        return 'text-gray-600 font-medium';
    }
  };

  // Kiểm tra nếu trạng thái đã thay đổi so với ban đầu
  const hasChanged = selectedStatus !== currentStatus && selectedStatus !== '';

  return (
    <div className="flex items-center space-x-2">
      <div className="w-40">
        <Select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="rounded-md border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 text-sm"
        >
          <option value="" disabled>
            Chọn trạng thái
          </option>
          {statuses.map((status) => (
            <option 
              key={status.value} 
              value={status.value}
              className={getStatusColor(status.value)}
            >
              {status.label}
            </option>
          ))}
        </Select>
      </div>
      
      <Button
        size="small"
        disabled={!hasChanged || loading}
        onClick={handleSubmit}
        className={`rounded-md transition-all duration-200 ${
          hasChanged 
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
        }`}
      >
        {loading ? (
          <BiLoaderAlt className="animate-spin h-4 w-4" />
        ) : (
          <FiSave className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default OrderStatusSelect; 