import React, { useContext, useState, useEffect } from "react";
import { Select } from "@windmill/react-ui";

//internal import
import OrderServices from "@/services/OrderServices";
import { notifySuccess, notifyError } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";

const OrderStatusSelect = ({ orderId, currentStatus, onStatusUpdate }) => {
    const { setIsUpdate } = useContext(SidebarContext);
    const [orderStatuses, setOrderStatuses] = useState([]);

    useEffect(() => {
        const fetchOrderStatuses = async () => {
            try {
                const response = await OrderServices.getOrderStatuses();
                if (response && response._embedded && response._embedded.orderStatus) {
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

            // Gọi callback để refresh dữ liệu
            if (onStatusUpdate) {
                onStatusUpdate();
            }
        } catch (err) {
            notifyError(err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái đơn hàng");
        }
    };

    return (
        <Select
            onChange={(e) => handleChangeStatus(orderId, e.target.value)}
            className="h-8"
        >
            <option value="" defaultValue hidden>
                Thay đổi trạng thái
            </option>
            {orderStatuses.map((status) => (
                <option
                    key={status.description}
                    value={status.description}
                    disabled={status.statusName === currentStatus}
                >
                    {status.statusName}
                </option>
            ))}
        </Select>
    );
};

export default OrderStatusSelect; 