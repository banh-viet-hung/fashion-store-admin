import { TableBody, TableCell, TableRow, Badge } from "@windmill/react-ui";

import { useTranslation } from "react-i18next";
import { FiZoomIn, FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useContext } from "react";

//internal import
import Status from "@/components/table/Status";
import Tooltip from "@/components/tooltip/Tooltip";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import OrderStatusSelect from "@/components/order/OrderStatusSelect";
import { SidebarContext } from "@/context/SidebarContext";

const OrderTable = ({ orders, fetchOrders }) => {
  const { t } = useTranslation();
  const { setIsUpdate } = useContext(SidebarContext);

  // Format ngày giờ theo định dạng Việt Nam
  const formatDateTimeVN = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format số tiền theo định dạng Việt Nam
  const formatCurrencyVN = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Xử lý khi trạng thái đơn hàng được cập nhật
  const handleStatusUpdate = () => {
    setIsUpdate(true);
    // Gọi hàm fetchOrders nếu được truyền vào từ component cha
    if (fetchOrders) {
      fetchOrders();
    }
  };

  // Get badge type based on status
  const getBadgeType = (status) => {
    if (!status) return "neutral";
    
    switch(status.toLowerCase()) {
      case "đã giao":
      case "delivered": 
        return "success";
      case "đã hủy":
      case "cancelled": 
        return "danger";
      case "đã thanh toán":
      case "paid": 
        return "primary";
      case "chờ giao hàng":
      case "out_for_delivery": 
        return "warning";
      case "chờ xác nhận":
      case "pending": 
        return "neutral";
      default: 
        return "neutral";
    }
  };

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {orders?.map((order, i) => (
          <TableRow 
            key={i + 1}
            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <TableCell className="pl-4">
              <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                #{order?.invoice}
              </span>
            </TableCell>

            <TableCell>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatDateTimeVN(order?.updatedDate).split(',')[0]}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTimeVN(order?.updatedDate).split(',')[1]}
                </span>
              </div>
            </TableCell>

            <TableCell className="text-right">
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrencyVN(order?.total)}
              </span>
            </TableCell>

            <TableCell className="text-center">
              <Badge 
                type={getBadgeType(order?.status)}
                className="px-3 py-1 w-28 justify-center"
              >
                <span className="truncate text-xs">
                  {order?.status || "Chờ xác nhận"}
                </span>
              </Badge>
            </TableCell>

            <TableCell className="text-center">
              <div className="flex justify-center">
                <OrderStatusSelect 
                  orderId={order._id} 
                  currentStatus={order.status}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </TableCell>

            <TableCell className="text-right pr-4">
              <div className="flex justify-end items-center space-x-1">
                <PrintReceipt orderId={order._id} />

                <Link 
                  to={`/order/${order._id}`}
                  className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Tooltip
                    id="view"
                    Icon={FiEye}
                    title={t("Xem chi tiết")}
                    bgColor="#059669"
                  />
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default OrderTable;
