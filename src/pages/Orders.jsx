import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Pagination,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Badge,
} from "@windmill/react-ui";
import { useContext, useState, useEffect } from "react";
import { IoCloudDownloadOutline, IoFilterOutline, IoSearch, IoClose } from "react-icons/io5";
import { FiCalendar, FiFilter, FiRefreshCw, FiTruck, FiCreditCard, FiList, FiInfo } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import exportFromJSON from "export-from-json";

//internal import
import { notifyError } from "@/utils/toast";
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import OrderServices from "@/services/OrderServices";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import OrderTable from "@/components/order/OrderTable";
import TableLoading from "@/components/preloader/TableLoading";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import AnimatedContent from "@/components/common/AnimatedContent";

const Orders = () => {
  const {
    currentPage,
    searchText,
    searchRef,
    resultsPerPage,
    handleChangePage,
    setCurrentPage,
    setIsUpdate,
    isUpdate,
  } = useContext(SidebarContext);

  const { t } = useTranslation();

  const [loadingExport, setLoadingExport] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    orderId: '',
    orderStatusCode: '',
    paymentMethodCode: '',
    shippingMethodCode: '',
    startDate: null,
    endDate: null
  });
  const [pagination, setPagination] = useState({
    size: 3,
    totalPages: 0,
    totalElements: 0
  });

  // Format date to MM/dd/yyyy
  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Define async function for useAsync hook
  const asyncFunction = async ({ cancelToken }) => {
    try {
      const formattedFilters = {
        ...filters,
        page: currentPage,
        size: pagination.size,
        startDate: filters.startDate ? formatDate(filters.startDate) : undefined,
        endDate: filters.endDate ? formatDate(filters.endDate) : undefined
      };

      const response = await OrderServices.getAdminOrders(formattedFilters);

      // Update pagination information
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      });

      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };

  // Use the useAsync hook for data fetching
  const { data, loading, error } = useAsync(asyncFunction);

  // Tìm tên phương thức thanh toán dựa trên mã
  const findMethodNameByCode = (methods, code) => {
    if (!code || !methods.length) return "";
    const method = methods.find(m => m.code === code);
    return method ? method.name : "";
  };

  // Process the orders data when available
  const orders = data?.data?.content ? adaptOrdersForTable(data.data.content) : [];

  // Adapter để chuyển đổi dữ liệu từ API mới sang định dạng OrderTable
  function adaptOrdersForTable(apiOrders) {
    return apiOrders.map(order => {
      // Tìm phương thức thanh toán từ danh sách
      let paymentMethodName = "";
      if (order.paymentMethodCode) {
        const method = paymentMethods.find(m => m.code === order.paymentMethodCode);
        paymentMethodName = method ? method.name : "Không xác định";
      } else {
        paymentMethodName = filters.paymentMethodCode ?
          findMethodNameByCode(paymentMethods, filters.paymentMethodCode) :
          "Chờ xác nhận";
      }

      return {
        _id: order.id.toString(),
        invoice: order.id.toString(),
        updatedDate: order.orderDate,
        user_info: { name: "Khách hàng" }, // Thông tin mặc định
        paymentMethod: paymentMethodName,
        total: order.total,
        status: order.currentStatus,
        originalData: order
      };
    });
  }

  // Reset trạng thái khi vào trang Orders
  useEffect(() => {
    setCurrentPage(1); // Reset currentPage về 1
    setIsUpdate(true); // Kích hoạt useAsync gọi lại API với trạng thái mới
  }, [setCurrentPage, setIsUpdate]);

  // Custom handler for page changes
  const handleOrderPageChange = (p) => {
    setCurrentPage(p);
    setIsUpdate(true);
  };

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const paymentRes = await OrderServices.getPaymentMethods();
        if (paymentRes && paymentRes._embedded && paymentRes._embedded.paymentMethod) {
          setPaymentMethods(paymentRes._embedded.paymentMethod);
        }

        const shippingRes = await OrderServices.getShippingMethods();
        if (shippingRes && shippingRes._embedded && shippingRes._embedded.shippingMethod) {
          setShippingMethods(shippingRes._embedded.shippingMethod);
        }

        const statusRes = await OrderServices.getOrderStatuses();
        if (statusRes && statusRes._embedded && statusRes._embedded.orderStatus) {
          setOrderStatuses(statusRes._embedded.orderStatus);
        }
      } catch (error) {
        notifyError("Không thể tải dữ liệu từ server");
      }
    };

    fetchMethods();
  }, []);

  const { currency, getNumber, getNumberTwo } = useUtilsFunction();

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (field, value) => {
    const date = value ? new Date(value) : null;
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    setIsUpdate(true); // Buộc useAsync gọi lại API
  };

  // Handle reset filters
  const handleResetField = () => {
    setFilters({
      orderId: '',
      orderStatusCode: '',
      paymentMethodCode: '',
      shippingMethodCode: '',
      startDate: null,
      endDate: null
    });

    if (searchRef.current) {
      searchRef.current.value = '';
    }

    // Reset pagination to first page
    setCurrentPage(1);
    setIsUpdate(true); // Buộc useAsync gọi lại API
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.orderId) count++;
    if (filters.orderStatusCode) count++;
    if (filters.paymentMethodCode) count++;
    if (filters.shippingMethodCode) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  // Generate filter summary text
  const getFilterSummary = () => {
    const summaries = [];

    if (filters.orderId) summaries.push(`Mã đơn: ${filters.orderId}`);

    if (filters.orderStatusCode) {
      const status = orderStatuses.find(s => s.description === filters.orderStatusCode);
      if (status) summaries.push(`Trạng thái: ${status.statusName}`);
    }

    if (filters.paymentMethodCode) {
      const method = paymentMethods.find(m => m.code === filters.paymentMethodCode);
      if (method) summaries.push(`Thanh toán: ${method.name}`);
    }

    if (filters.shippingMethodCode) {
      const method = shippingMethods.find(m => m.code === filters.shippingMethodCode);
      if (method) summaries.push(`Vận chuyển: ${method.name}`);
    }

    if (filters.startDate && filters.endDate) {
      const formattedStart = filters.startDate.toLocaleDateString('vi-VN');
      const formattedEnd = filters.endDate.toLocaleDateString('vi-VN');
      summaries.push(`Từ ${formattedStart} đến ${formattedEnd}`);
    } else if (filters.startDate) {
      const formattedStart = filters.startDate.toLocaleDateString('vi-VN');
      summaries.push(`Từ ${formattedStart}`);
    } else if (filters.endDate) {
      const formattedEnd = filters.endDate.toLocaleDateString('vi-VN');
      summaries.push(`Đến ${formattedEnd}`);
    }

    return summaries;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <PageTitle>{t("Quản lý đơn hàng")}</PageTitle>
        <div className="flex items-center gap-2">
          <Button
            layout="outline"
            size="small"
            className="flex items-center gap-1 rounded-lg border-gray-200 dark:border-gray-600"
            onClick={toggleFilters}
          >
            <FiFilter className="h-4 w-4" />
            <span className="hidden md:inline-block">Lọc</span>
            {getActiveFiltersCount() > 0 && (
              <Badge type="danger" className="ml-1 px-1.5 py-0.5">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Active filter summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="mb-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiInfo className="text-blue-500 mr-2" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Lọc hiện tại:</span>
              </div>
              <Button
                layout="link"
                size="small"
                className="text-blue-600 text-xs hover:text-blue-800"
                onClick={handleResetField}
              >
                Xóa tất cả
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {getFilterSummary().map((summary, index) => (
                <Badge key={index} type="info" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 px-2 py-0.5 text-xs flex items-center">
                  {summary}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatedContent>
        <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <Card className="min-w-0 shadow-sm bg-white dark:bg-gray-800 mb-4 border border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <FiFilter className="mr-2 h-4 w-4 text-emerald-500" />
                Lọc đơn hàng
              </h3>
              <Button
                layout="link"
                size="small"
                className="text-gray-500 hover:text-gray-700"
                onClick={toggleFilters}
              >
                <IoClose className="h-5 w-5" />
              </Button>
            </div>
            <CardBody className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Cột 1: Thông tin đơn hàng & Trạng thái */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <IoSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Input
                        ref={searchRef}
                        type="search"
                        name="search"
                        placeholder="Tìm theo mã đơn hàng"
                        value={filters.orderId}
                        onChange={(e) => handleFilterChange('orderId', e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiList className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Select
                        value={filters.orderStatusCode}
                        onChange={(e) => handleFilterChange('orderStatusCode', e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      >
                        <option value="" defaultValue>
                          Tất cả trạng thái
                        </option>
                        {orderStatuses.map((status) => (
                          <option key={status.description} value={status.description}>
                            {status.statusName}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Cột 2: Phương thức */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiTruck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Select
                        value={filters.shippingMethodCode}
                        onChange={(e) => handleFilterChange('shippingMethodCode', e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      >
                        <option value="" defaultValue>
                          Tất cả phương thức vận chuyển
                        </option>
                        {shippingMethods.map((method) => (
                          <option key={method.code} value={method.code}>
                            {method.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiCreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Select
                        value={filters.paymentMethodCode}
                        onChange={(e) => handleFilterChange('paymentMethodCode', e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      >
                        <option value="" defaultValue>
                          Tất cả phương thức thanh toán
                        </option>
                        {paymentMethods.map((method) => (
                          <option key={method.code} value={method.code}>
                            {method.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Cột 3: Thời gian */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <Input
                          type="date"
                          name="startDate"
                          placeholder="Từ ngày"
                          onChange={(e) => handleDateChange('startDate', e.target.value)}
                          className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <Input
                          type="date"
                          name="endDate"
                          placeholder="Đến ngày"
                          onChange={(e) => handleDateChange('endDate', e.target.value)}
                          className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                      <Button
                        type="reset"
                        onClick={handleResetField}
                        className="h-11 bg-red-300 hover:bg-red-400 dark:bg-red-700 dark:hover:bg-red-600 text-white dark:text-white rounded-lg flex items-center gap-2 transition-all duration-200 px-5 w-32 justify-center shadow-sm hover:shadow-md font-medium border-0"
                      >
                        <FiRefreshCw className="h-4 w-4" />
                        <span>Đặt lại</span>
                      </Button>

                      <Button
                        type="submit"
                        className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 px-5 w-32 justify-center shadow-sm hover:shadow font-medium border-0"
                      >
                        <IoFilterOutline className="h-4 w-4" />
                        <span>Áp dụng</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </AnimatedContent>

      {loading ? (
        <div className="animate-pulse">
          <TableLoading row={12} col={7} width={160} height={20} />
        </div>
      ) : orders.length !== 0 ? (
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <TableContainer className="mb-0">
              <Table>
                <TableHeader>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <TableCell className="font-semibold text-xs uppercase pl-4">
                      {t("Mã đơn hàng")}
                    </TableCell>
                    <TableCell className="font-semibold text-xs uppercase">
                      {t("Ngày đặt")}
                    </TableCell>
                    <TableCell className="font-semibold text-xs uppercase text-right">
                      {t("Tổng tiền")}
                    </TableCell>
                    <TableCell className="font-semibold text-xs uppercase text-center">
                      {t("Trạng thái đơn hàng")}
                    </TableCell>
                    <TableCell className="font-semibold text-xs uppercase text-center">
                      {t("Thao tác")}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs uppercase pr-4">
                      {t("InvoiceTbl")}
                    </TableCell>
                  </tr>
                </TableHeader>

                <OrderTable orders={orders} fetchOrders={() => setIsUpdate(true)} />
              </Table>

              <TableFooter>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Hiển thị {orders.length} trên {pagination.totalElements} đơn hàng
                  </div>
                  <Pagination
                    totalResults={pagination.totalElements}
                    resultsPerPage={pagination.size}
                    onChange={handleOrderPageChange}
                    label="Table navigation"
                  />
                </div>
              </TableFooter>
            </TableContainer>
          </CardBody>
        </Card>
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default Orders;
