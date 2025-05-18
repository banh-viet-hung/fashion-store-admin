import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Badge,
  Select,
} from "@windmill/react-ui";
import { useContext, useState, useEffect, useRef } from "react";
import { FiEdit, FiPlus, FiTrash2, FiRefreshCw, FiFilter, FiCalendar, FiInfo, FiList } from "react-icons/fi";
import { IoSearch, IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import CouponServices from "@/services/CouponServices";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import PageTitle from "@/components/Typography/PageTitle";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import CouponDrawer from "@/components/drawer/CouponDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import PaginationLoading from "@/components/preloader/PaginationLoading";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import CheckBox from "@/components/form/others/CheckBox";
import CouponTable from "@/components/coupon/CouponTable";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";

const Coupons = () => {
  const { t } = useTranslation();
  const { toggleDrawer, lang } = useContext(SidebarContext);
  const {
    couponPage,
    searchText,
    resultsPerPage,
    handleChangePage,
    setCurrentPage,
    setIsUpdate,
    isUpdate,
    pageLoading,
    setPageLoading,
    setCurrentPageType,
  } = useContext(SidebarContext);

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    size: 3,
    totalPages: 0,
    totalElements: 0
  });
  const couponRef = useRef(null);

  const { allId, serviceId, handleDeleteMany } = useToggleDrawer();

  // Set the current page type when component mounts
  useEffect(() => {
    setCurrentPageType("coupon");
  }, [setCurrentPageType]);

  // Define async function for useAsync hook
  const asyncFunction = async ({ cancelToken }) => {
    try {
      const filters = {
        page: couponPage,
        size: pagination.size,
        code: searchCode || undefined
      };

      const response = await CouponServices.getAllCoupons(filters);

      // Update pagination information
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      });

      return response;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  };

  // Use the useAsync hook for data fetching
  const { data, loading, error } = useAsync(asyncFunction);

  // Turn off page loading after data is fetched
  useEffect(() => {
    if (data && !loading) {
      setPageLoading(false);
    }
  }, [data, loading, setPageLoading]);

  // Extract coupons from response
  const coupons = data?.data?.content || [];

  // Reset state when entering Coupons page
  useEffect(() => {
    setCurrentPage(1);
    setIsUpdate(true);
  }, [setCurrentPage, setIsUpdate]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(coupons?.map((li) => String(li.id)));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  // handle search function
  const handleSubmitCoupon = (e) => {
    e.preventDefault();
    setSearchCode(couponRef.current.value);
    setCurrentPage(1);
    setIsUpdate(true);
  };

  // handle reset field function
  const handleResetField = () => {
    setSearchCode("");
    if (couponRef.current) {
      couponRef.current.value = "";
    }
    setCurrentPage(1);
    setIsUpdate(true);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    return searchCode ? 1 : 0;
  };

  // Generate filter summary text
  const getFilterSummary = () => {
    const summaries = [];

    if (searchCode) summaries.push(`Mã giảm giá: ${searchCode}`);

    return summaries;
  };

  return (
    <>
      {pageLoading && <PaginationLoading />}
      <div className="flex justify-between items-center mb-4">
        <PageTitle>{t("Quản lý Mã giảm giá")}</PageTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => isCheck?.length > 0 && handleDeleteMany(isCheck)}
            layout="outline"
            size="small"
            className={`flex items-center gap-1 rounded-lg border-gray-200 dark:border-gray-600 ${isCheck?.length < 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-300'}`}
          >
            <FiTrash2 className={`h-4 w-4 ${isCheck?.length < 1 ? 'text-gray-400' : 'text-red-600'}`} />
            <span className={`hidden md:inline-block ${isCheck?.length < 1 ? 'text-gray-400' : 'text-red-600'}`}>
              {t("Xóa")}
            </span>
            {isCheck?.length > 0 && (
              <Badge type="danger" className="ml-1 px-1.5 py-0.5">
                {isCheck?.length}
              </Badge>
            )}
          </Button>

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

          <Button
            onClick={toggleDrawer}
            layout="outline"
            size="small"
            className="flex items-center gap-1 rounded-lg border-gray-200 dark:border-gray-600"
          >
            <FiPlus className="h-4 w-4" />
            <span className="hidden md:inline-block">{t("Thêm Mã giảm giá")}</span>
          </Button>
        </div>
      </div>

      <DeleteModal
        ids={allId}
        setIsCheck={setIsCheck}
        title="Selected Coupon"
      />
      <BulkActionDrawer ids={allId} title="Coupons" />

      <MainDrawer>
        <CouponDrawer id={serviceId} />
      </MainDrawer>

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
                Lọc mã giảm giá
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
              <form
                onSubmit={handleSubmitCoupon}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <IoSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Input
                        ref={couponRef}
                        type="search"
                        placeholder={t("Nhập code")}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-8 flex items-end gap-3">
                    <Button
                      type="submit"
                      className="h-10 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 px-5 w-32 justify-center shadow-sm hover:shadow-md font-medium"
                    >
                      <IoSearch className="h-4 w-4" />
                      <span>Áp dụng</span>
                    </Button>

                    <Button
                      type="reset"
                      onClick={handleResetField}
                      className="h-10 bg-red-300 hover:bg-red-400 dark:bg-red-700 dark:hover:bg-red-600 text-white dark:text-white rounded-lg flex items-center gap-2 transition-all duration-200 px-5 w-32 justify-center shadow-sm hover:shadow-md font-medium border-0"
                    >
                      <FiRefreshCw className="h-4 w-4" />
                      <span>Đặt lại</span>
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </AnimatedContent>

      {loading ? (
        <div className="animate-pulse">
          <TableLoading row={12} col={8} width={140} height={20} />
        </div>
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : coupons?.length !== 0 ? (
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <TableContainer className="mb-0">
              <Table>
                <TableHeader>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <TableCell className="pl-4">
                      <CheckBox
                        type="checkbox"
                        name="selectAll"
                        id="selectAll"
                        handleClick={handleSelectAll}
                        isChecked={isCheckAll}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-xs uppercase">Tên chiến dịch</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">Mã giảm giá</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">Giảm giá</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">Ngày bắt đầu</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">Ngày kết thúc</TableCell>
                    <TableCell className="font-semibold text-xs uppercase text-center">Lượt sử dụng</TableCell>
                    <TableCell className="font-semibold text-xs uppercase text-center">Trạng thái</TableCell>
                    <TableCell className="text-right pr-4 font-semibold text-xs uppercase">
                      Thao tác
                    </TableCell>
                  </tr>
                </TableHeader>
                <CouponTable
                  lang={lang}
                  isCheck={isCheck}
                  coupons={coupons}
                  setIsCheck={setIsCheck}
                />
              </Table>
              <TableFooter>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <PaginationInfo
                    currentPage={couponPage}
                    itemsPerPage={pagination.size}
                    totalItems={pagination.totalElements || 0}
                    itemLabel="mã giảm giá"
                  />
                  <Pagination
                    totalResults={pagination.totalElements}
                    resultsPerPage={pagination.size}
                    onChange={(p) => handleChangePage(p, "coupon")}
                    label="Table navigation"
                  />
                </div>
              </TableFooter>
            </TableContainer>
          </CardBody>
        </Card>
      ) : (
        <NotFound title="Không có mã giảm giá nào" />
      )}
    </>
  );
};

export default Coupons;
