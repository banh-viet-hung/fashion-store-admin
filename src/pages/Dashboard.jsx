import {
  Card,
  CardBody,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  WindmillContext,
  Badge,
  Select,
  Button,
  Label,
  Tab,
  Tabs
} from "@windmill/react-ui";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiCheck,
  FiRefreshCw,
  FiShoppingCart,
  FiTruck,
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiFilter,
  FiLoader,
  FiList,
  FiPackage,
  FiPieChart,
  FiGrid,
  FiCreditCard,
  FiPercent
} from "react-icons/fi";
import { ImCreditCard } from "react-icons/im";
import Skeleton from "react-loading-skeleton";

//internal import
import useAsync from "@/hooks/useAsync";
import LineChart from "@/components/chart/LineChart/LineChart";
import PieChart from "@/components/chart/Pie/PieChart";
import BarChart from "@/components/chart/Bar/BarChart";
import CardItem from "@/components/dashboard/CardItem";
import CardItemTwo from "@/components/dashboard/CardItemTwo";
import ChartCard from "@/components/chart/ChartCard";
import OrderTable from "@/components/order/OrderTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import DashboardService from "@/services/DashboardService";
import OrderServices from "@/services/OrderServices";
import AnimatedContent from "@/components/common/AnimatedContent";

const Dashboard = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { currentPage, handleChangePage } = useContext(SidebarContext);

  // Date range states (global filter)
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Period states for specific charts
  const [revenuePeriod, setRevenuePeriod] = useState('day');
  const [orderTrendsPeriod, setOrderTrendsPeriod] = useState('day');

  // Top products limit state
  const [topProductsLimit, setTopProductsLimit] = useState(10);

  // Low stock products states
  const [lowStockLimit, setLowStockLimit] = useState(10);
  const [lowStockSortBy, setLowStockSortBy] = useState('quantity_asc');

  // Dashboard summary state
  const [dashboardSummary, setDashboardSummary] = useState(null);

  // Revenue data state
  const [revenueData, setRevenueData] = useState([]);

  // Order status data state
  const [orderStatusData, setOrderStatusData] = useState([]);

  // Top selling products state
  const [topProducts, setTopProducts] = useState([]);

  // Inventory data state
  const [inventoryData, setInventoryData] = useState([]);

  // Sales by category state
  const [categorySalesData, setCategorySalesData] = useState([]);

  // Order trends state
  const [orderTrends, setOrderTrends] = useState([]);

  // Loading states
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [isLoadingOrderStatus, setIsLoadingOrderStatus] = useState(true);
  const [isLoadingTopProducts, setIsLoadingTopProducts] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isLoadingCategorySales, setIsLoadingCategorySales] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [isFilteringRevenue, setIsFilteringRevenue] = useState(false);
  const [isFilteringTrends, setIsFilteringTrends] = useState(false);
  const [isFilteringTopProducts, setIsFilteringTopProducts] = useState(false);
  const [isFilteringLowStock, setIsFilteringLowStock] = useState(false);

  // Add view state for category sales
  const [categorySalesView, setCategorySalesView] = useState('chart'); // 'chart' or 'table'

  // Recent orders
  const { data: dashboardRecentOrder, loading: loadingRecentOrder } = useAsync(
    () => OrderServices.getDashboardRecentOrder({ page: currentPage, limit: 8 })
  );

  const { dataTable, serviceData } = useAsync(dashboardRecentOrder?.orders || []);

  // Fetch data from APIs
  const fetchDashboardData = async () => {
    try {
      setIsLoadingSummary(true);
      const summaryData = await DashboardService.getDashboardSummary();
      setDashboardSummary(summaryData.data);
      setIsLoadingSummary(false);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      setIsLoadingSummary(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      setIsLoadingRevenue(true);
      const data = await DashboardService.getRevenueStatistics(startDate, endDate, revenuePeriod);
      setRevenueData(data.data);
      setIsLoadingRevenue(false);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setIsLoadingRevenue(false);
    }
  };

  const fetchOrderStatusData = async () => {
    try {
      setIsLoadingOrderStatus(true);
      const data = await DashboardService.getOrdersByStatus(startDate, endDate);
      setOrderStatusData(data.data);
      setIsLoadingOrderStatus(false);
    } catch (error) {
      console.error("Error fetching order status data:", error);
      setIsLoadingOrderStatus(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setIsLoadingTopProducts(true);
      const data = await DashboardService.getTopSellingProducts(topProductsLimit, startDate, endDate);
      setTopProducts(data.data);
      setIsLoadingTopProducts(false);
    } catch (error) {
      console.error("Error fetching top products:", error);
      setIsLoadingTopProducts(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      setIsLoadingInventory(true);
      const data = await DashboardService.getInventoryStatistics(lowStockLimit, lowStockSortBy);
      console.log("Inventory data:", data); // Debug log
      setInventoryData(data.data || []);
      setIsLoadingInventory(false);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setIsLoadingInventory(false);
    }
  };

  const fetchCategorySalesData = async () => {
    try {
      setIsLoadingCategorySales(true);
      const data = await DashboardService.getSalesByCategory(startDate, endDate);
      setCategorySalesData(data.data);
      setIsLoadingCategorySales(false);
    } catch (error) {
      console.error("Error fetching category sales data:", error);
      setIsLoadingCategorySales(false);
    }
  };

  const fetchOrderTrends = async () => {
    try {
      setIsLoadingTrends(true);
      const data = await DashboardService.getOrderTrends(startDate, endDate, orderTrendsPeriod);
      setOrderTrends(data.data);
      setIsLoadingTrends(false);
    } catch (error) {
      console.error("Error fetching order trends:", error);
      setIsLoadingTrends(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = async (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Handle period change for revenue chart
  const handleRevenuePeriodChange = (e) => {
    setRevenuePeriod(e.target.value);
    setIsFilteringRevenue(true);
    // Fetch revenue data with new period
    DashboardService.getRevenueStatistics(startDate, endDate, e.target.value)
      .then(data => {
        setRevenueData(data.data);
        setIsFilteringRevenue(false);
      })
      .catch(error => {
        console.error("Error fetching revenue data:", error);
        setIsFilteringRevenue(false);
      });
  };

  // Handle period change for order trends chart
  const handleOrderTrendsPeriodChange = (e) => {
    setOrderTrendsPeriod(e.target.value);
    setIsFilteringTrends(true);
    // Fetch order trends data with new period
    DashboardService.getOrderTrends(startDate, endDate, e.target.value)
      .then(data => {
        setOrderTrends(data.data);
        setIsFilteringTrends(false);
      })
      .catch(error => {
        console.error("Error fetching order trends:", error);
        setIsFilteringTrends(false);
      });
  };

  // Handle limit change for top products
  const handleTopProductsLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setTopProductsLimit(newLimit);
    setIsFilteringTopProducts(true);

    // Fetch top products data with new limit
    DashboardService.getTopSellingProducts(newLimit, startDate, endDate)
      .then(data => {
        setTopProducts(data.data);
        setIsFilteringTopProducts(false);
      })
      .catch(error => {
        console.error("Error fetching top products:", error);
        setIsFilteringTopProducts(false);
      });
  };

  // Handle low stock settings change
  const handleLowStockLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setLowStockLimit(newLimit);
    setIsFilteringLowStock(true);

    // Fetch low stock products with new settings
    DashboardService.getInventoryStatistics(newLimit, lowStockSortBy)
      .then(data => {
        setInventoryData(data.data || []);
        setIsFilteringLowStock(false);
      })
      .catch(error => {
        console.error("Error fetching low stock products:", error);
        setIsFilteringLowStock(false);
      });
  };

  const handleLowStockSortChange = (e) => {
    const newSortBy = e.target.value;
    setLowStockSortBy(newSortBy);
    setIsFilteringLowStock(true);

    // Fetch low stock products with new settings
    DashboardService.getInventoryStatistics(lowStockLimit, newSortBy)
      .then(data => {
        setInventoryData(data.data || []);
        setIsFilteringLowStock(false);
      })
      .catch(error => {
        console.error("Error fetching low stock products:", error);
        setIsFilteringLowStock(false);
      });
  };

  // Apply global filter button handler
  const handleApplyFilters = () => {
    fetchDashboardData();
    fetchRevenueData();
    fetchOrderStatusData();
    fetchTopProducts();
    fetchCategorySalesData();
    fetchOrderTrends();
    fetchInventoryData();
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    fetchRevenueData();
    fetchOrderStatusData();
    fetchTopProducts();
    fetchInventoryData();
    fetchCategorySalesData();
    fetchOrderTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Prepare data for charts
  const prepareRevenueChartData = () => {
    return revenueData.map(item => ({
      date: dayjs(item.date).format('DD/MM'),
      revenue: item.revenue / 1000000, // Convert to millions for better display
      orders: item.orderCount
    }));
  };

  const prepareOrderStatusChartData = () => {
    return orderStatusData.map(item => ({
      name: item.statusName,
      value: item.count
    }));
  };

  const prepareCategoryChartData = () => {
    return categorySalesData.map(category => ({
      name: category.categoryName,
      revenue: category.totalRevenue / 1000000, // Convert to millions for better display
      percentage: category.percentage
    }));
  };

  return (
    <>
      <PageTitle>{"Phân tích"}</PageTitle>

      <AnimatedContent>
        {/* Dashboard Summary Section */}
        <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-3">
          <CardItem
            title="Tổng đơn hàng"
            Icon={FiShoppingCart}
            loading={isLoadingSummary}
            quantity={dashboardSummary?.totalOrders || 0}
            className="text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-500"
          />
          <CardItem
            title="Tổng doanh thu"
            Icon={FiDollarSign}
            loading={isLoadingSummary}
            quantity={formatCurrency(dashboardSummary?.totalRevenue || 0)}
            className="text-emerald-600 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-500"
          />
          <CardItem
            title="Tổng sản phẩm"
            Icon={FiBarChart2}
            loading={isLoadingSummary}
            quantity={dashboardSummary?.totalProducts || 0}
            className="text-blue-600 dark:text-blue-100 bg-blue-100 dark:bg-blue-500"
          />
          <CardItem
            title="Tổng khách hàng"
            Icon={FiCalendar}
            loading={isLoadingSummary}
            quantity={dashboardSummary?.totalCustomers || 0}
            className="text-purple-600 dark:text-purple-100 bg-purple-100 dark:bg-purple-500"
          />
          <CardItem
            title="Giá trị trung bình đơn hàng"
            Icon={FiTrendingUp}
            loading={isLoadingSummary}
            quantity={formatCurrency(dashboardSummary?.averageOrderValue || 0)}
            className="text-indigo-600 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-500"
          />
          <CardItem
            title="Đơn hàng đang chờ xử lý"
            Icon={FiClock}
            loading={isLoadingSummary}
            quantity={dashboardSummary?.pendingOrders || 0}
            className="text-amber-600 dark:text-amber-100 bg-amber-100 dark:bg-amber-500"
          />
        </div>

        {/* Global Date range filter section */}
        <Card className="mb-4">
          <CardBody>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-2 text-lg font-medium text-gray-700 dark:text-gray-300">
                <FiFilter className="w-5 h-5" />
                <span>Lọc dữ liệu</span>
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 items-center">
                <label className="font-medium">Khoảng thời gian:</label>
                <input
                  type="date"
                  className="px-3 py-2 border rounded-md dark:bg-gray-800"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>-</span>
                <input
                  type="date"
                  className="px-3 py-2 border rounded-md dark:bg-gray-800"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Button onClick={handleApplyFilters}>
                  Áp dụng
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Order status statistics */}
        <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
          {orderStatusData.map((status) => (
            <CardItem
              key={status.statusCode}
              title={status.statusName}
              Icon={
                status.statusCode === 'PENDING' ? FiRefreshCw :
                  status.statusCode === 'OUT_FOR_DELIVERY' ? FiTruck :
                    status.statusCode === 'DELIVERED' ? FiCheck :
                      FiShoppingCart
              }
              loading={isLoadingOrderStatus}
              quantity={status.count}
              secondValue={`${status.percentage.toFixed(1)}%`}
              className={
                status.statusCode === 'DELIVERED' ? "text-emerald-600 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-500" :
                  status.statusCode === 'PENDING' ? "text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-500" :
                    status.statusCode === 'CANCELLED' ? "text-red-600 dark:text-red-100 bg-red-100 dark:bg-red-500" :
                      "text-blue-600 dark:text-blue-100 bg-blue-100 dark:bg-blue-500"
              }
            />
          ))}
        </div>

        {/* Charts section */}
        <div className="grid gap-4 mb-8 md:grid-cols-2">
          {/* Revenue chart */}
          <ChartCard
            mode={mode}
            loading={isLoadingRevenue}
            title="Thống kê doanh thu"
            filterComponent={
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium">Thời kỳ:</label>
                <div className="flex items-center gap-2">
                  <Select
                    className="w-32 text-sm h-8 py-0"
                    value={revenuePeriod}
                    onChange={handleRevenuePeriodChange}
                    disabled={isFilteringRevenue}
                  >
                    <option value="day">Theo ngày</option>
                    <option value="week">Theo tuần</option>
                    <option value="month">Theo tháng</option>
                    <option value="year">Theo năm</option>
                  </Select>
                  {isFilteringRevenue && (
                    <FiLoader className="animate-spin text-blue-500" />
                  )}
                </div>
              </div>
            }
          >
            <LineChart
              salesReport={prepareRevenueChartData()}
              xKey="date"
              lineKeys={['revenue']}
              yAxisLabel="Triệu VND"
            />
          </ChartCard>

          {/* Order status pie chart */}
          <ChartCard
            mode={mode}
            loading={isLoadingOrderStatus}
            title="Phân bố trạng thái đơn hàng"
          >
            <PieChart data={prepareOrderStatusChartData()} nameKey="name" dataKey="value" />
          </ChartCard>
        </div>

        {/* Additional charts section */}
        <div className="grid gap-4 mb-8 md:grid-cols-2">
          {/* Category sales chart */}
          <Card className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <p className="font-semibold text-gray-800 dark:text-gray-300">
                {isLoadingCategorySales ? (
                  <Skeleton
                    count={1}
                    height={20}
                    className="dark:bg-gray-800 bg-gray-200"
                    baseColor={`${mode === "dark" ? "#010101" : "#f9f9f9"}`}
                    highlightColor={`${mode === "dark" ? "#1a1c23" : "#f8f8f8"} `}
                  />
                ) : (
                  "Doanh thu theo danh mục"
                )}
              </p>
              {!isLoadingCategorySales && (
                <div className="flex items-center gap-2">
                  <button
                    className={`flex items-center gap-1 p-1.5 rounded ${categorySalesView === 'chart' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setCategorySalesView('chart')}
                  >
                    <FiBarChart2 className="w-4 h-4" />
                    <span className="text-xs">Biểu đồ</span>
                  </button>
                  <button
                    className={`flex items-center gap-1 p-1.5 rounded ${categorySalesView === 'table' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setCategorySalesView('table')}
                  >
                    <FiGrid className="w-4 h-4" />
                    <span className="text-xs">Bảng</span>
                  </button>
                </div>
              )}
            </div>

            <div className="chart-container" style={{ minHeight: "250px" }}>
              {isLoadingCategorySales ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Skeleton
                    className="dark:bg-gray-800 bg-gray-200"
                    baseColor={`${mode === "dark" ? "#010101" : "#f9f9f9"}`}
                    highlightColor={`${mode === "dark" ? "#1a1c23" : "#f8f8f8"} `}
                    count={1}
                    width="100%"
                    height={250}
                  />
                </div>
              ) : categorySalesData && categorySalesData.length > 0 ? (
                <>
                  {categorySalesView === 'chart' && (
                    <BarChart
                      data={prepareCategoryChartData()}
                      xAxisDataKey="name"
                      barDataKeys={['revenue']}
                      barColors={['#34D399']}
                      yAxisLabel="Triệu VND"
                    />
                  )}

                  {categorySalesView === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="w-full whitespace-nowrap">
                        <thead>
                          <tr className="text-xs font-medium tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <th className="px-4 py-3">Danh mục</th>
                            <th className="px-4 py-3 text-right">Doanh thu</th>
                            <th className="px-4 py-3 text-right">Số đơn hàng</th>
                            <th className="px-4 py-3 text-right">Số sản phẩm</th>
                            <th className="px-4 py-3 text-right">Tỷ trọng</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                          {categorySalesData.map((category, i) => (
                            <tr key={category.categoryId} className="text-gray-700 dark:text-gray-300">
                              <td className="px-4 py-3 flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: ['#34D399', '#3B82F6', '#F97316', '#0EA5E9', '#6366F1', '#EC4899'][i % 6] }}></div>
                                <span>{category.categoryName}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                {formatCurrency(category.totalRevenue)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {category.orderCount} đơn
                              </td>
                              <td className="px-4 py-3 text-right">
                                {category.itemCount} sản phẩm
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  <FiPercent className="w-3 h-3 mr-1" />
                                  {category.percentage.toFixed(2)}%
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold text-gray-900 dark:text-white border-t dark:border-gray-700">
                            <td className="px-4 py-3">Tổng cộng</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(categorySalesData.reduce((sum, item) => sum + item.totalRevenue, 0))}</td>
                            <td className="px-4 py-3 text-right">{categorySalesData.reduce((sum, item) => sum + item.orderCount, 0)} đơn</td>
                            <td className="px-4 py-3 text-right">{categorySalesData.reduce((sum, item) => sum + item.itemCount, 0)} sản phẩm</td>
                            <td className="px-4 py-3 text-right">100%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  Không có dữ liệu thống kê danh mục
                </div>
              )}
            </div>
          </Card>

          {/* Order trends chart */}
          <ChartCard
            mode={mode}
            loading={isLoadingTrends}
            title="Xu hướng đơn hàng"
            filterComponent={
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium">Thời kỳ:</label>
                <div className="flex items-center gap-2">
                  <Select
                    className="w-32 text-sm h-8 py-0"
                    value={orderTrendsPeriod}
                    onChange={handleOrderTrendsPeriodChange}
                    disabled={isFilteringTrends}
                  >
                    <option value="day">Theo ngày</option>
                    <option value="week">Theo tuần</option>
                    <option value="month">Theo tháng</option>
                  </Select>
                  {isFilteringTrends && (
                    <FiLoader className="animate-spin text-blue-500" />
                  )}
                </div>
              </div>
            }
          >
            <LineChart
              salesReport={orderTrends.map(item => ({
                date: dayjs(item.date).format('DD/MM'),
                orders: item.orderCount,
                growth: item.growth
              }))}
              xKey="date"
              lineKeys={['orders', 'growth']}
              yAxisLabel="Đơn hàng"
            />
          </ChartCard>
        </div>

        {/* Top Products Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <PageTitle>Sản phẩm bán chạy</PageTitle>
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <label className="font-medium flex items-center gap-2">
              <FiList className="w-5 h-5" />
              <span>Top</span>
            </label>
            <div className="flex items-center gap-2">
              <Select
                className="w-24 text-sm py-1"
                value={topProductsLimit}
                onChange={handleTopProductsLimitChange}
                disabled={isFilteringTopProducts}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </Select>
              {isFilteringTopProducts && (
                <FiLoader className="animate-spin text-blue-500" />
              )}
            </div>
            <span className="text-sm text-gray-500">sản phẩm</span>
          </div>
        </div>

        {isLoadingTopProducts ? (
          <TableLoading row={5} col={4} />
        ) : (
          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Số lượng đã bán</TableCell>
                  <TableCell>Doanh thu</TableCell>
                  <TableCell>Tồn kho</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </tr>
              </TableHeader>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.productId}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 rounded-full overflow-hidden">
                          <img
                            src={product.imageUrl || "/placeholder.png"}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{product.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.totalQuantitySold}</TableCell>
                    <TableCell>{formatCurrency(product.totalRevenue)}</TableCell>
                    <TableCell>{product.currentStock}</TableCell>
                    <TableCell>
                      {product.isLowStock ? (
                        <Badge type="danger">Sắp hết hàng</Badge>
                      ) : (
                        <Badge type="success">Còn hàng</Badge>
                      )}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}

        {/* Low Stock Products Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <PageTitle>Sản phẩm sắp hết hàng</PageTitle>
          <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
            <div className="flex items-center gap-2">
              <label className="font-medium flex items-center gap-2">
                <FiPackage className="w-5 h-5" />
                <span>Hiển thị</span>
              </label>
              <div className="flex items-center gap-2">
                <Select
                  className="w-20 text-sm py-1"
                  value={lowStockLimit}
                  onChange={handleLowStockLimitChange}
                  disabled={isFilteringLowStock}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </Select>
                <span className="text-sm text-gray-500">sản phẩm</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Sắp xếp:</label>
              <div className="flex items-center gap-2">
                <Select
                  className="w-36 text-sm py-1"
                  value={lowStockSortBy}
                  onChange={handleLowStockSortChange}
                  disabled={isFilteringLowStock}
                >
                  <option value="quantity_asc">Tồn kho (thấp-cao)</option>
                  <option value="quantity_desc">Tồn kho (cao-thấp)</option>
                </Select>
                {isFilteringLowStock && (
                  <FiLoader className="animate-spin text-blue-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoadingInventory ? (
          <TableLoading row={5} col={5} />
        ) : (
          <TableContainer className="mb-8">
            {inventoryData && inventoryData.length > 0 ? (
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell>Tồn kho hiện tại</TableCell>
                    <TableCell>Ngưỡng tồn kho thấp</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {inventoryData.map((product) => (
                    <tr key={product.productId}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 mr-3 rounded-full overflow-hidden">
                            <img
                              src={product.imageUrl || "/placeholder.png"}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{product.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell className={product.isLowStock ? "text-red-600 font-semibold" : ""}>
                        {product.quantity}
                      </TableCell>
                      <TableCell>{product.lowStockThreshold}</TableCell>
                      <TableCell>
                        {product.lowStock ? (
                          <Badge type="danger">
                            <div className="flex items-center">
                              <FiAlertTriangle className="mr-1" />
                              Sắp hết hàng
                            </div>
                          </Badge>
                        ) : (
                          <Badge type="success">
                            <div className="flex items-center">
                              <FiCheck className="mr-1" />
                              Chưa cảnh báo
                            </div>
                          </Badge>
                        )}
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <NotFound title="Không có sản phẩm nào sắp hết hàng" />
            )}
          </TableContainer>
        )}

        {/* Recent Orders Section */}
        <PageTitle>Đơn hàng gần đây</PageTitle>
        {loadingRecentOrder ? (
          <TableLoading row={5} col={4} />
        ) : dashboardRecentOrder?.orders?.length ? (
          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Hóa đơn</TableCell>
                  <TableCell>Ngày đặt hàng</TableCell>
                  <TableCell>Tên khách hàng</TableCell>
                  <TableCell>Phương thức thanh toán</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </tr>
              </TableHeader>
              <OrderTable orders={dashboardRecentOrder.orders} />
            </Table>
            <TableFooter>
              <Pagination
                totalResults={dashboardRecentOrder.totalOrder}
                resultsPerPage={8}
                onChange={handleChangePage}
                label="Table navigation"
              />
            </TableFooter>
          </TableContainer>
        ) : (
          <NotFound title="Không tìm thấy đơn hàng nào" />
        )}
      </AnimatedContent>
    </>
  );
};

export default Dashboard;
