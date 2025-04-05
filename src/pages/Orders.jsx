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
} from "@windmill/react-ui";
import { useContext, useState, useEffect } from "react";
import { IoCloudDownloadOutline } from "react-icons/io5";
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

  return (
    <>
      <PageTitle>{t("Quản lý đơn hàng")}</PageTitle>

      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:gap-4 xl:gap-6 md:gap-2 md:grid-cols-5 py-2">
                <div>
                  <Input
                    ref={searchRef}
                    type="search"
                    name="search"
                    placeholder="Nhập mã đơn hàng"
                    value={filters.orderId}
                    onChange={(e) => handleFilterChange('orderId', e.target.value)}
                  />
                </div>

                <div>
                  <Select
                    value={filters.orderStatusCode}
                    onChange={(e) => handleFilterChange('orderStatusCode', e.target.value)}
                  >
                    <option value="" defaultValue>
                      {t("Trạng thái đơn hàng")}
                    </option>
                    {orderStatuses.map((status) => (
                      <option key={status.description} value={status.description}>
                        {status.statusName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.shippingMethodCode}
                    onChange={(e) => handleFilterChange('shippingMethodCode', e.target.value)}
                  >
                    <option value="" defaultValue>
                      {t("Phương thức vận chuyển")}
                    </option>
                    {shippingMethods.map((method) => (
                      <option key={method.code} value={method.code}>
                        {method.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={filters.paymentMethodCode}
                    onChange={(e) => handleFilterChange('paymentMethodCode', e.target.value)}
                  >
                    <option value="" defaultValue>
                      {t("Phương thức thanh toán")}
                    </option>
                    {paymentMethods.map((method) => (
                      <option key={method.code} value={method.code}>
                        {method.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 lg:gap-6 xl:gap-6 lg:grid-cols-3 xl:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 py-2">
                <div>
                  <Label>Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    name="startDate"
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Ngày kết thúc</Label>
                  <Input
                    type="date"
                    name="endDate"
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                  />
                </div>
                <div className="mt-2 md:mt-0 flex items-center xl:gap-x-4 gap-x-1 flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                  <div className="w-full mx-1">
                    <Label style={{ visibility: "hidden" }}>Filter</Label>
                    <Button
                      type="submit"
                      className="h-12 w-full bg-emerald-700"
                    >
                      Áp dụng
                    </Button>
                  </div>

                  <div className="w-full">
                    <Label style={{ visibility: "hidden" }}>Reset</Label>
                    <Button
                      layout="outline"
                      onClick={handleResetField}
                      type="reset"
                      className="px-4 md:py-1 py-3 text-sm dark:bg-gray-700"
                    >
                      <span className="text-black dark:text-gray-200">
                        Hoàn tác
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </AnimatedContent>

      {loading ? (
        <TableLoading row={12} col={7} width={160} height={20} />
      ) : orders.length !== 0 ? (
        <TableContainer className="mb-8 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>{t("Mã đơn hàng")}</TableCell>
                <TableCell>{t("Ngày đặt")}</TableCell>
                <TableCell>{t("Tổng tiền")}</TableCell>
                <TableCell>{t("Trạng thái đơn hàng")}</TableCell>
                <TableCell>{t("Thao tác")}</TableCell>
                <TableCell className="text-right">{t("InvoiceTbl")}</TableCell>
              </tr>
            </TableHeader>

            <OrderTable orders={orders} fetchOrders={() => setIsUpdate(true)} />
          </Table>

          <TableFooter>
            <Pagination
              totalResults={pagination.totalElements}
              resultsPerPage={pagination.size}
              onChange={handleOrderPageChange}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Không tìm thấy đơn hàng nào." />
      )}
    </>
  );
};

export default Orders;
