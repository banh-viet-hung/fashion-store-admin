import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableCell,
  TableContainer,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { IoBagHandle } from "react-icons/io5";

//internal import
import OrderServices from "@/services/OrderServices";
import PageTitle from "@/components/Typography/PageTitle";
import Loading from "@/components/preloader/Loading";
import CustomerOrderTable from "@/components/customer/CustomerOrderTable";
import { notifyError } from "@/utils/toast";

const CustomerOrder = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [orderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserOrders = async () => {
    try {
      setIsLoading(true);
      const response = await OrderServices.getUserOrders(id);
      if (response.success) {
        setOrderData(response.data || []);
      } else {
        setError(response.message || "Không thể tải đơn hàng");
        notifyError(response.message || "Không thể tải đơn hàng");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tải đơn hàng");
      notifyError(err.message || "Đã xảy ra lỗi khi tải đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [id]);

  return (
    <>
      <PageTitle>Danh sách đơn hàng khách hàng</PageTitle>

      {isLoading && <Loading loading={isLoading} />}
      {!error && !isLoading && orderData.length === 0 && (
        <div className="w-full bg-white rounded-md dark:bg-gray-800">
          <div className="p-8 text-center">
            <span className="flex justify-center my-30 text-red-500 font-semibold text-6xl">
              <IoBagHandle />
            </span>
            <h2 className="font-medium text-base mt-4 text-gray-600">
              Khách hàng chưa có đơn hàng nào
            </h2>
          </div>
        </div>
      )}

      {orderData.length > 0 && !error && !isLoading ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Thời gian đặt</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell className="text-center">
                  Trạng thái
                </TableCell>
                <TableCell className="text-center">
                  Thao tác
                </TableCell>
              </tr>
            </TableHeader>
            <CustomerOrderTable orders={orderData} fetchOrders={fetchUserOrders} />
          </Table>
        </TableContainer>
      ) : null}
    </>
  );
};

export default CustomerOrder;
