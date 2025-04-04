import { Badge } from "@windmill/react-ui";

const Status = ({ status }) => {
  // Phân loại trạng thái để hiển thị màu sắc phù hợp
  const getStatusType = (status) => {
    const pendingStatuses = [
      "Pending", 
      "Inactive", 
      "Đang xử lý", 
      "Chờ xử lý", 
      "WAITING_FOR_PAYMENT", 
      "Chờ thanh toán"
    ];
    
    const processingStatuses = [
      "Processing", 
      "Đang giao hàng", 
      "SHIPPING", 
      "PAID", 
      "Đã thanh toán", 
      "PENDING"
    ];
    
    const successStatuses = [
      "Delivered", 
      "Active", 
      "Đã giao", 
      "DELIVERED", 
      "Hoàn thành", 
      "Completed"
    ];
    
    const cancelStatuses = [
      "Cancel", 
      "Đã hủy", 
      "CANCELLED", 
      "Hủy đơn"
    ];

    if (pendingStatuses.includes(status)) return "warning";
    if (processingStatuses.includes(status)) return "primary";
    if (successStatuses.includes(status)) return "success";
    if (cancelStatuses.includes(status)) return "danger";
    
    return "primary";
  };

  return (
    <>
      <span className="font-serif">
        <Badge type={getStatusType(status)}>{status}</Badge>
      </span>
    </>
  );
};

export default Status;
