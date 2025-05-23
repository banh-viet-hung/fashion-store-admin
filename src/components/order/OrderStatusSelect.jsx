import React, { useState, useEffect } from 'react';
import { Select, Button } from '@windmill/react-ui';
import { FiSave } from 'react-icons/fi';
import { BiLoaderAlt } from 'react-icons/bi';

import OrderServices from '@/services/OrderServices';
import { notifyError, notifySuccess } from "@/utils/toast";

const OrderStatusSelect = ({ orderId, currentStatus, onStatusUpdate, orderStatuses = [] }) => {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [fetchingStatuses, setFetchingStatuses] = useState(false);

  // Cập nhật selectedStatus mỗi khi currentStatus thay đổi
  useEffect(() => {
    setSelectedStatus('');
  }, [currentStatus]);

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
        // Sử dụng message từ API response thay vì hardcoded text
        notifySuccess(response.message || "Cập nhật trạng thái đơn hàng thành công!");

        // Gọi callback để cập nhật lại dữ liệu
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        // Hiển thị thông báo lỗi từ API
        notifyError(response.message || "Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      // Hiển thị thông báo lỗi từ response API nếu có
      const errorMessage = error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật trạng thái";
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xác định màu của option dựa trên giá trị trạng thái
  const getStatusColor = (description) => {
    switch (description) {
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
  const hasChanged = selectedStatus !== '' && selectedStatus !== currentStatus;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-40">
        <Select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="rounded-md border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 text-sm"
          disabled={fetchingStatuses}
        >
          <option value="" disabled>
            {fetchingStatuses ? "Đang tải..." : "Chọn trạng thái"}
          </option>
          {orderStatuses.map((status) => (
            <option
              key={status.description}
              value={status.description}
              className={getStatusColor(status.description)}
            >
              {status.statusName}
            </option>
          ))}
        </Select>
      </div>

      <Button
        size="small"
        disabled={!hasChanged || loading || fetchingStatuses}
        onClick={handleSubmit}
        className={`rounded-md transition-all duration-200 ${hasChanged && !fetchingStatuses
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