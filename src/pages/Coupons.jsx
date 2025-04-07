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
} from "@windmill/react-ui";
import { useContext, useState, useEffect, useRef } from "react";
import { FiEdit, FiPlus, FiTrash2, FiRefreshCw } from "react-icons/fi";
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
import CheckBox from "@/components/form/others/CheckBox";
import CouponTable from "@/components/coupon/CouponTable";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";

const Coupons = () => {
  const { t } = useTranslation();
  const { toggleDrawer, lang } = useContext(SidebarContext);
  const {
    currentPage,
    searchText,
    resultsPerPage,
    handleChangePage,
    setCurrentPage,
    setIsUpdate,
    isUpdate,
  } = useContext(SidebarContext);

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [pagination, setPagination] = useState({
    size: 3,
    totalPages: 0,
    totalElements: 0
  });
  const couponRef = useRef(null);

  const { allId, serviceId, handleDeleteMany } = useToggleDrawer();

  // Define async function for useAsync hook
  const asyncFunction = async ({ cancelToken }) => {
    try {
      const filters = {
        page: currentPage,
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
  
  // Extract coupons from response
  const coupons = data?.data?.content || [];

  // Reset state when entering Coupons page
  useEffect(() => {
    setCurrentPage(1);
    setIsUpdate(true);
  }, [setCurrentPage, setIsUpdate]);

  // Custom handler for page changes
  const handleCouponPageChange = (p) => {
    setCurrentPage(p);
    setIsUpdate(true);
  };

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

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <PageTitle>{t("Quản lý Coupons")}</PageTitle>
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
            onClick={toggleDrawer}
            layout="outline"
            size="small"
            className="flex items-center gap-1 rounded-lg border-gray-200 dark:border-gray-600"
          >
            <FiPlus className="h-4 w-4" />
            <span className="hidden md:inline-block">{t("Thêm coupon")}</span>
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

      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form
              onSubmit={handleSubmitCoupon}
              className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex"
            >
              <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <Input
                  ref={couponRef}
                  type="search"
                  placeholder={t("Nhập code")}
                />
              </div>
              <div className="flex items-center gap-2 flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <div className="w-full mx-1">
                  <Button type="submit" className="h-12 w-full bg-emerald-700">
                    Áp dụng
                  </Button>
                </div>

                <div className="w-full mx-1">
                  <Button
                    layout="outline"
                    onClick={handleResetField}
                    type="reset"
                    className="flex items-center justify-center gap-2 px-4 h-12 text-sm dark:bg-gray-700 w-full"
                  >
                    <FiRefreshCw className="h-4 w-4" />
                    <span className="text-black dark:text-gray-200">Hoàn tác</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
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
                    <TableCell>Tên chiến dịch</TableCell>
                    <TableCell>Mã giảm giá</TableCell>
                    <TableCell>Giảm giá</TableCell>
                    <TableCell>Ngày bắt đầu</TableCell>
                    <TableCell>Ngày kết thúc</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell className="text-right pr-4">
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
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Hiển thị {coupons?.length || 0} trên {pagination.totalElements || 0} coupons
                  </div>
                  <Pagination
                    totalResults={pagination.totalElements}
                    resultsPerPage={pagination.size}
                    onChange={handleCouponPageChange}
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
