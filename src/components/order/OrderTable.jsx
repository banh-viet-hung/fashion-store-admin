import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

import { useTranslation } from "react-i18next";
import { FiZoomIn } from "react-icons/fi";
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

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {orders?.map((order, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <span className="font-semibold uppercase text-xs">
                #{order?.invoice}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {formatDateTimeVN(order?.updatedDate)}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {formatCurrencyVN(order?.total)}
              </span>
            </TableCell>

            <TableCell className="text-xs">
              <Status status={order?.status} />
            </TableCell>

            <TableCell className="text-center">
              <OrderStatusSelect 
                orderId={order._id} 
                currentStatus={order.status}
                onStatusUpdate={handleStatusUpdate}
              />
            </TableCell>

            <TableCell className="text-right flex justify-end">
              <div className="flex justify-between items-center">
                <PrintReceipt orderId={order._id} />

                <span className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  <Link to={`/order/${order._id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiZoomIn}
                      title={t("Xem chi tiết")}
                      bgColor="#059669"
                    />
                  </Link>
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default OrderTable;
