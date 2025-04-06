import { useParams } from "react-router";
import ReactToPrint from "react-to-print";
import React, { useContext, useRef, useState } from "react";
import { FiPrinter, FiMail } from "react-icons/fi";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { Button, Badge } from "@windmill/react-ui";
import {
  TableCell,
  TableHeader,
  Table,
  TableContainer,
  WindmillContext,
  TableBody,
  TableRow,
  Card,
  CardBody,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { PDFDownloadLink } from "@react-pdf/renderer";

//internal import
import useAsync from "@/hooks/useAsync";
import useError from "@/hooks/useError";
import Status from "@/components/table/Status";
import { notifyError, notifySuccess } from "@/utils/toast";
import { AdminContext } from "@/context/AdminContext";
import OrderServices from "@/services/OrderServices";
import Invoice from "@/components/invoice/Invoice";
import Loading from "@/components/preloader/Loading";
import logoDark from "@/assets/img/logo/logo-dark.svg";
import logoLight from "@/assets/img/logo/logo-color.svg";
import PageTitle from "@/components/Typography/PageTitle";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useDisableForDemo from "@/hooks/useDisableForDemo";
import InvoiceForDownload from "@/components/invoice/InvoiceForDownload";

const OrderInvoice = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const { id } = useParams();
  const printRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error } = useAsync(() =>
    OrderServices.getOrderById(id)
  );

  const { handleErrorNotification } = useError();
  const { handleDisableForDemo } = useDisableForDemo();
  const { currency, globalSetting, showDateFormat, getNumberTwo } = useUtilsFunction();

  // Format ngày giờ theo định dạng Việt Nam
  const formatDateTimeVN = (dateString) => {
    if (!dateString) return '';
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

  const handleEmailInvoice = async (inv) => {
    if (handleDisableForDemo()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...inv,
        date: showDateFormat(inv.createdAt),
        company_info: {
          currency: currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };

      const res = await OrderServices.sendEmailInvoiceToCustomer(updatedData);
      notifySuccess(res.message);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      handleErrorNotification(err, "handleEmailInvoice");
    }
  };

  // Get current active status
  const getCurrentStatus = (orderStatusDetails) => {
    if (!orderStatusDetails || orderStatusDetails.length === 0) return null;
    
    // Sort by date (newest first)
    const sortedStatuses = [...orderStatusDetails].sort((a, b) => 
      new Date(b.updateAt) - new Date(a.updateAt)
    );
    
    return sortedStatuses[0];
  };

  const currentStatus = data?.data?.orderStatusDetails ? 
    getCurrentStatus(data.data.orderStatusDetails) : null;

  // Status color mapping
  const getStatusColor = (status) => {
    if (!status) return "warning";
    
    switch(status.description) {
      case "DELIVERED": return "success";
      case "CANCELLED": return "danger";
      case "PAID": return "primary";
      case "OUT_FOR_DELIVERY": return "warning";
      case "PENDING": return "neutral";
      default: return "warning";
    }
  };

  // Prepare document data for PDF
  const prepareDocumentData = () => {
    return {
      invoice: id,
      createdAt: currentStatus?.updateAt,
      user_info: {
        name: data?.data?.shippingAddress?.fullName,
        contact: data?.data?.shippingAddress?.phoneNumber,
        address: data?.data?.shippingAddress?.address,
        city: data?.data?.shippingAddress?.city,
        country: "Việt Nam",
        zipCode: ""
      },
      status: currentStatus?.statusName || "Chờ xác nhận",
      items: data?.data?.items?.map(item => ({
        itemName: `Sản phẩm #${item.productId}`,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      })),
      subTotal: data?.data?.priceDetails?.subTotal,
      shippingCost: data?.data?.priceDetails?.shipping,
      discount: data?.data?.priceDetails?.discount,
      total: data?.data?.priceDetails?.total,
      paymentMethod: data?.data?.paymentMethod?.name
    };
  };

  return (
    <>
      <PageTitle> Chi tiết đơn hàng #{id} </PageTitle>

      {loading ? (
        <Loading loading={loading} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : (
        <div ref={printRef} className="space-y-6">
          {/* Phần 1: Trạng thái và Tổng quan đơn hàng - Phần người dùng quan tâm đầu tiên */}
          <Card className="mb-4 shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-r from-emerald-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Trạng thái đơn hàng</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cập nhật: {formatDateTimeVN(currentStatus?.updateAt)}
                  </p>
                </div>
              </div>
            </div>
            
            <CardBody className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Badge 
                      type={getStatusColor(currentStatus)}
                      className="text-md px-3 py-1"
                    >
                      {currentStatus?.statusName || "Chờ xác nhận"}
                    </Badge>
                    <span className="ml-3 text-sm text-gray-500">
                      Cập nhật bởi: {currentStatus?.updatedBy || "Hệ thống"}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex gap-2">
                    <ReactToPrint
                      trigger={() => (
                        <button className="flex items-center text-xs md:text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-white bg-emerald-500 border border-transparent active:bg-emerald-600 hover:bg-emerald-600">
                          <FiPrinter className="mr-1" />
                          In
                        </button>
                      )}
                      content={() => printRef.current}
                      documentTitle={`Đơn hàng-${id}`}
                    />
                    
                    <PDFDownloadLink
                      document={
                        <InvoiceForDownload
                          t={t}
                          data={prepareDocumentData()}
                          currency={currency}
                          getNumberTwo={getNumberTwo}
                          showDateFormat={showDateFormat}
                        />
                      }
                      fileName={`Hóa đơn-${id}`}
                    >
                      {({ blob, url, loading, error }) =>
                        loading ? (
                          "..."
                        ) : (
                          <button className="flex items-center text-xs md:text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-white bg-teal-500 border border-transparent active:bg-teal-600 hover:bg-teal-600">
                            <IoCloudDownloadOutline className="mr-1" />
                            Tải xuống
                          </button>
                        )
                      }
                    </PDFDownloadLink>
                    
                    {globalSetting?.email_to_customer && (
                      <button
                        onClick={() => handleEmailInvoice(data)}
                        disabled={isSubmitting}
                        className="flex items-center text-xs md:text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-white bg-blue-500 border border-transparent active:bg-blue-600 hover:bg-blue-600"
                      >
                        {isSubmitting ? (
                          <>
                            <img
                              src={spinnerLoadingImage}
                              alt="Loading"
                              width={16}
                              height={16}
                              className="mr-1"
                            />
                            Đang gửi
                          </>
                        ) : (
                          <>
                            <FiMail className="mr-1" />
                            Email
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mã đơn hàng</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">#{id}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phương thức thanh toán</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{data?.data?.paymentMethod?.name}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phương thức vận chuyển</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{data?.data?.shippingMethod?.name}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tổng tiền</p>
                  <p className="font-semibold text-emerald-600">{formatCurrencyVN(data?.data?.priceDetails?.total || 0)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Phần 2: Danh sách sản phẩm - Thông tin chính của đơn hàng */}
          <Card className="shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Sản phẩm đã đặt</h2>
            </div>
            
            <CardBody className="p-0">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>STT</TableCell>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell>Thuộc tính</TableCell>
                      <TableCell className="text-center">Số lượng</TableCell>
                      <TableCell className="text-right">Tổng tiền</TableCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">SP-{item.productId}</TableCell>
                        <TableCell>
                          {item.size && <span className="inline-block px-2 py-1 mr-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Size: {item.size}</span>}
                          {item.color && <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Màu: {item.color}</span>}
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrencyVN(item.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>

          {/* Phần 3: Tổng quan về thông tin thanh toán và giao hàng - Grid layout 2 cột */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3.1: Thông tin giá trị đơn hàng */}
            <Card className="shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="bg-gradient-to-r from-yellow-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Thông tin thanh toán</h2>
              </div>
              
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Tạm tính:</span>
                    <span className="font-medium">{formatCurrencyVN(data?.data?.priceDetails?.subTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Phí vận chuyển:</span>
                    <span className="font-medium">{formatCurrencyVN(data?.data?.priceDetails?.shipping || 0)}</span>
                  </div>
                  {data?.data?.priceDetails?.discount > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Giảm giá:</span>
                      <span className="font-medium text-red-500">-{formatCurrencyVN(data?.data?.priceDetails?.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 font-semibold text-lg bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Tổng cộng:</span>
                    <span className="text-emerald-600">{formatCurrencyVN(data?.data?.priceDetails?.total || 0)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">Phương thức thanh toán</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{data?.data?.paymentMethod?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {data?.data?.paymentMethod?.description}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-2">Phương thức vận chuyển</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{data?.data?.shippingMethod?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {data?.data?.shippingMethod?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 3.2: Thông tin địa chỉ giao hàng */}
            <Card className="shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="bg-gradient-to-r from-purple-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Địa chỉ giao hàng</h2>
              </div>
              
              <CardBody>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-purple-100 dark:bg-purple-900 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {data?.data?.shippingAddress?.fullName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {data?.data?.shippingAddress?.phoneNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-2 pl-10 border-l-2 border-purple-200 dark:border-purple-700">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {data?.data?.shippingAddress?.address}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {data?.data?.shippingAddress?.ward}, {data?.data?.shippingAddress?.district}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {data?.data?.shippingAddress?.city}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Phần 4: Lịch sử trạng thái đơn hàng - Timeline */}
          <Card className="shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Lịch sử trạng thái đơn hàng</h2>
            </div>
            
            <CardBody>
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 h-full border-l-2 border-gray-200 dark:border-gray-700"></div>
                
                <div className="space-y-6">
                  {data?.data?.orderStatusDetails
                    ?.sort((a, b) => new Date(b.updateAt) - new Date(a.updateAt))
                    .map((status, index) => (
                    <div key={index} className="flex items-start ml-2">
                      <div className={`absolute -left-1 mt-1.5 rounded-full border-4 border-white dark:border-gray-800 h-10 w-10 flex items-center justify-center ${
                        index === 0 
                          ? 'bg-emerald-500 text-white' 
                          : status.description === "CANCELLED"
                            ? 'bg-red-400 text-white'
                            : status.description === "DELIVERED"
                              ? 'bg-green-400 text-white'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}>
                        {index === 0 && <span className="text-xs font-bold">Mới</span>}
                      </div>
                      <div className="ml-12">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                            {status.statusName}
                          </h3>
                          <Badge type={
                            status.description === "DELIVERED" ? "success" : 
                            status.description === "CANCELLED" ? "danger" : 
                            status.description === "PAID" ? "primary" :
                            "warning"
                          }>
                            {status.description}
                          </Badge>
                        </div>
                        <time className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {formatDateTimeVN(status.updateAt)}
                        </time>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cập nhật bởi: {status.updatedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
};

export default OrderInvoice;
