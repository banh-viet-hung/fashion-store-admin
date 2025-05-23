import { useParams } from "react-router";
import ReactToPrint from "react-to-print";
import React, { useContext, useRef, useState, useEffect } from "react";
import { FiPrinter, FiMail, FiDownload } from "react-icons/fi";
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
import ProductServices from "@/services/ProductServices";
import Invoice from "@/components/invoice/Invoice";
import Loading from "@/components/preloader/Loading";
import logoDark from "@/assets/img/logo/logo-dark.svg";
import logoLight from "@/assets/img/logo/logo-color.svg";
import PageTitle from "@/components/Typography/PageTitle";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useDisableForDemo from "@/hooks/useDisableForDemo";
import SimpleInvoiceDownload from "@/components/invoice/SimpleInvoiceDownload";

const OrderInvoice = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const { id } = useParams();
  const printRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [productImages, setProductImages] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { data, loading, error } = useAsync(() =>
    OrderServices.getOrderById(id)
  );

  // Fetch product details and images for each product in the order
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (data?.data?.items && data.data.items.length > 0) {
        setLoadingProducts(true);
        const detailsMap = {};
        const imagesMap = {};

        try {
          // Create an array of promises for concurrent fetching
          const promises = data.data.items.map(async (item) => {
            try {
              // Fetch product details
              const response = await ProductServices.getProductById(item.productId);
              if (response && response.success) {
                detailsMap[item.productId] = response.data;

                // Try to get images from product.image first
                if (response.data.image && response.data.image.length > 0) {
                  imagesMap[item.productId] = response.data.image;
                } else {
                  // If no direct image, try the separate API
                  try {
                    const imagesResponse = await ProductServices.getProductImages(item.productId);
                    if (imagesResponse && imagesResponse.success) {
                      // Handle the embedded image structure
                      if (imagesResponse.data._embedded && imagesResponse.data._embedded.image) {
                        imagesMap[item.productId] = imagesResponse.data._embedded.image.map(img => img.url);
                      } else if (Array.isArray(imagesResponse.data)) {
                        // Handle direct array of images
                        imagesMap[item.productId] = imagesResponse.data.map(img => img.url || img);
                      }
                    }
                  } catch (imgErr) {
                    console.error(`Error fetching images for product ${item.productId}:`, imgErr);
                  }
                }
              }
            } catch (err) {
              console.error(`Error fetching details for product ${item.productId}:`, err);
            }
          });

          // Wait for all product details to be fetched
          await Promise.all(promises);
          setProductDetails(detailsMap);
          setProductImages(imagesMap);
        } catch (err) {
          console.error("Error fetching product details:", err);
        } finally {
          setLoadingProducts(false);
        }
      }
    };

    fetchProductDetails();
  }, [data?.data?.items]);

  // Get product image from various possible sources
  const getProductImage = (productId) => {
    // Check if we have images for this product
    if (productImages[productId] && productImages[productId].length > 0) {
      return productImages[productId][0];
    }

    // Try to get from product details directly
    const product = productDetails[productId];
    if (product) {
      if (product.image && product.image.length > 0) {
        return product.image[0];
      }

      // For some products, it might be a string
      if (product.image && typeof product.image === 'string') {
        return product.image;
      }
    }

    // Return placeholder if no image found
    return "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";
  };

  // Get product name from details
  const getProductName = (productId) => {
    const product = productDetails[productId];
    if (product) {
      // Handle different product name structures
      if (product.name) {
        return product.name;
      } else if (product.title) {
        // Handle possible language object
        if (typeof product.title === 'object') {
          return product.title.en || product.title.vi || Object.values(product.title)[0];
        }
        return product.title;
      }
    }
    return `SP-${productId}`;
  };

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

    switch (status.description) {
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
        zipCode: "",
        email: data?.data?.customer?.email || ""
      },
      status: currentStatus?.statusName || "Chờ xác nhận",
      items: data?.data?.items?.map(item => ({
        itemName: getProductName(item.productId),
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
                    <PDFDownloadLink
                      document={
                        <SimpleInvoiceDownload
                          data={prepareDocumentData()}
                        />
                      }
                      fileName={`Hoa-don-${id}.pdf`}
                    >
                      {({ blob, url, loading, error }) => (
                        <button
                          className="flex items-center text-xs md:text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-white bg-blue-600 border border-transparent active:bg-blue-700 hover:bg-blue-700"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <img
                                src={spinnerLoadingImage}
                                alt="Loading"
                                width={16}
                                height={16}
                                className="mr-1"
                              />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <FiDownload className="mr-1" />
                              Xuất hóa đơn
                            </>
                          )}
                        </button>
                      )}
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
                    {data?.data?.items?.map((item, index) => {
                      const productImage = getProductImage(item.productId);
                      const productName = getProductName(item.productId);

                      return (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-md object-cover border border-gray-200"
                                  src={productImage}
                                  alt={productName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";
                                  }}
                                />
                              </div>

                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                  {loadingProducts ? (
                                    <span className="inline-block w-24 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                                  ) : (
                                    productName
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Mã: {item.productId}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.size && <span className="inline-block px-2 py-1 mr-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Size: {item.size}</span>}
                            {item.color && <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Màu: {item.color}</span>}
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrencyVN(item.price)}</TableCell>
                        </TableRow>
                      );
                    })}
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

            <CardBody className="p-6">
              {data?.data?.orderStatusDetails && data.data.orderStatusDetails.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 md:left-8 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  <div className="space-y-8">
                    {data.data.orderStatusDetails
                      .sort((a, b) => new Date(b.updateAt) - new Date(a.updateAt))
                      .map((status, index) => {
                        // Determine status color
                        const statusColor =
                          status.description === "DELIVERED" ? "bg-green-500" :
                            status.description === "CANCELLED" ? "bg-red-500" :
                              status.description === "PAID" ? "bg-blue-500" :
                                status.description === "PROCESSING" ? "bg-yellow-500" :
                                  status.description === "OUT_FOR_DELIVERY" ? "bg-purple-500" :
                                    "bg-gray-400";

                        // Determine badge type
                        const badgeType =
                          status.description === "DELIVERED" ? "success" :
                            status.description === "CANCELLED" ? "danger" :
                              status.description === "PAID" ? "primary" :
                                "warning";

                        return (
                          <div key={index} className="relative pl-8 md:pl-12">
                            {/* Status circle */}
                            <div className={`absolute left-0 md:left-2 top-0 mt-1 ${statusColor} rounded-full w-4 h-4 md:w-5 md:h-5 z-10 shadow-md ring-4 ring-white dark:ring-gray-800`}></div>

                            {/* Content */}
                            <div className={`relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 ${status.description === "DELIVERED" ? "border-green-500" :
                              status.description === "CANCELLED" ? "border-red-500" :
                                status.description === "PAID" ? "border-blue-500" :
                                  status.description === "PROCESSING" ? "border-yellow-500" :
                                    status.description === "OUT_FOR_DELIVERY" ? "border-purple-500" :
                                      "border-gray-400"
                              }`}>
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">
                                      {status.statusName}
                                    </h3>
                                    <Badge type={badgeType} className="text-xs">
                                      {status.description}
                                    </Badge>
                                    {index === 0 && (
                                      <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full">
                                        Mới nhất
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Cập nhật bởi: <span className="font-medium">{status.updatedBy}</span>
                                  </p>
                                </div>
                                <time className="text-xs text-gray-500 dark:text-gray-400 mt-1 md:mt-0 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                  {formatDateTimeVN(status.updateAt)}
                                </time>
                              </div>

                              {status.description === "CANCELLED" && status.cancelReason && (
                                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{t("Lí do hủy")}:</span> {status.cancelReason}
                                  </p>
                                </div>
                              )}

                              {status.note && (
                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600">
                                  <p className="italic">{status.note}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Chưa có lịch sử trạng thái</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Đơn hàng chưa có cập nhật trạng thái nào.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
};

export default OrderInvoice;
