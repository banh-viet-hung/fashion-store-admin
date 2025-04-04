import React, { useContext, useState, useEffect } from "react";
import { TableCell, TableBody, TableRow, Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

//internal import
import Status from "@/components/table/Status";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { SidebarContext } from "@/context/SidebarContext";
import OrderServices from "@/services/OrderServices";
import { notifySuccess, notifyError } from "@/utils/toast";

// import Status from '../table/Status';
// import SelectStatus from '../form/SelectStatus';

const CustomerOrderTable = ({ orders }) => {
  const { t } = useTranslation();
  const { getNumberTwo } = useUtilsFunction();
  const { setIsUpdate } = useContext(SidebarContext);
  const [orderStatuses, setOrderStatuses] = useState([]);
  
  useEffect(() => {
    const fetchOrderStatuses = async () => {
      try {
        const response = await OrderServices.getOrderStatus();
        if (response?._embedded?.orderStatus) {
          setOrderStatuses(response._embedded.orderStatus);
        }
      } catch (err) {
        console.error("Error fetching order statuses:", err);
      }
    };
    
    fetchOrderStatuses();
  }, []);

  const handleChangeStatus = async (orderId, statusCode) => {
    try {
      await OrderServices.updateOrderStatus(orderId, statusCode);
      notifySuccess("Cập nhật trạng thái đơn hàng thành công!");
      setIsUpdate(true);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái đơn hàng");
    }
  };

  // Format date to Vietnamese format
  const formatVietnameseDate = (dateString) => {
    if (!dateString) return '';
    const date = dayjs(dateString);
    return date.format('DD/MM/YYYY HH:mm');
  };

  // Format currency to VND
  const formatVietnameseCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <>
      <TableBody>
        {orders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <span className="font-semibold uppercase text-xs">
                {order.id}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {formatVietnameseDate(order.orderDate)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{order.phoneNumber}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-semibold">
                {formatVietnameseCurrency(order.total)}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <Status status={order.currentStatus} />
            </TableCell>
            <TableCell className="text-right">
              <Select
                onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                className="h-8"
              >
                <option value="status" defaultValue hidden>
                  Thay đổi trạng thái
                </option>
                {orderStatuses.map((status) => (
                  <option key={status.statusName} value={status.description}>
                    {status.statusName}
                  </option>
                ))}
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default CustomerOrderTable;
