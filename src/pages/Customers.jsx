import React, { useRef, useContext, useEffect, useState } from "react";
import {
  Card,
  Button,
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
import { useTranslation } from "react-i18next";
import { FiFilter, FiPlus, FiSearch, FiInfo, FiMail } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

import CustomerTable from "@/components/customer/CustomerTable";
import TableLoading from "@/components/preloader/TableLoading";
import PaginationLoading from "@/components/preloader/PaginationLoading";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import CustomerServices from "@/services/CustomerServices";
import AnimatedContent from "@/components/common/AnimatedContent";
import { SidebarContext } from "@/context/SidebarContext";

const Customers = () => {
  const { t } = useTranslation();
  const {
    customerPage,
    setCurrentPage,
    searchText,
    setSearchText,
    resultsPerPage,
    setIsUpdate,
    pageLoading,
    handleChangePage,
    setPageLoading,
    setCurrentPageType,
  } = useContext(SidebarContext);

  // Trạng thái mới cho bộ lọc
  const [showFilters, setShowFilters] = useState(false);
  const userRef = useRef(null);

  // Set the current page type when component mounts
  useEffect(() => {
    setCurrentPageType("customer");
  }, [setCurrentPageType]);

  const asyncFunction = async ({ cancelToken }) => {
    const page = customerPage;
    const size = 3;
    const email = searchText || "";
    return CustomerServices.getAllCustomers({ page, size, email, cancelToken });
  };

  const { data, loading, error } = useAsync(asyncFunction);

  // Turn off page loading after data is fetched
  useEffect(() => {
    if (data && !loading) {
      setPageLoading(false);
    }
  }, [data, loading, setPageLoading]);

  // Reset trạng thái khi vào trang Customer
  useEffect(() => {
    setSearchText(""); // Reset searchText về rỗng
    setCurrentPage(1); // Reset currentPage về 1
    setIsUpdate(true); // Kích hoạt useAsync gọi lại API với trạng thái mới
  }, [setSearchText, setCurrentPage, setIsUpdate]);

  const handleSubmitUser = (e) => {
    e.preventDefault();
    setSearchText(userRef.current.value);
    setCurrentPage(1);
    setIsUpdate(true); // Buộc useAsync gọi lại API
  };

  const handleResetField = () => {
    setSearchText("");
    setCurrentPage(1);
    setIsUpdate(true); // Buộc useAsync gọi lại API
    if (userRef.current) userRef.current.value = "";
  };

  // Hiển thị/ẩn bộ lọc
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Kiểm tra nếu có bộ lọc active
  const hasActiveFilters = () => {
    return searchText;
  };

  return (
    <>
      {pageLoading && <PaginationLoading />}
      <div className="flex justify-between items-center mb-4">
        <PageTitle>{t("Quản lý khách hàng")}</PageTitle>
        <div className="flex items-center gap-2">
          <Button
            layout="outline"
            size="small"
            className="flex items-center gap-1 rounded-lg border-gray-200 dark:border-gray-600"
            onClick={toggleFilters}
          >
            <FiFilter className="h-4 w-4" />
            <span className="hidden md:inline-block">Lọc</span>
            {hasActiveFilters() && (
              <Badge type="danger" className="ml-1 px-1.5 py-0.5">
                1
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Active filter summary */}
      {hasActiveFilters() && (
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
              {searchText && (
                <Badge type="info" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 px-2 py-0.5 text-xs flex items-center">
                  Email: {searchText}
                </Badge>
              )}
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
                Lọc khách hàng
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
              <form onSubmit={handleSubmitUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cột 1: Tìm kiếm email */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Input
                        ref={userRef}
                        type="search"
                        name="search"
                        placeholder={t("Nhập email khách hàng")}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      />
                    </div>
                  </div>

                  {/* Cột 2: Nút hành động */}
                  <div className="space-y-3 flex items-end">
                    <div className="flex justify-end gap-3 mt-2 w-full">
                      <Button
                        type="reset"
                        onClick={handleResetField}
                        className="h-11 bg-red-300 hover:bg-red-400 dark:bg-red-700 dark:hover:bg-red-600 text-white dark:text-white rounded-lg flex items-center gap-2 transition-all duration-200 px-5 w-32 justify-center shadow-sm hover:shadow-md font-medium border-0"
                      >
                        <span>Đặt lại</span>
                      </Button>

                      <Button
                        type="submit"
                        className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 px-5 w-32 justify-center shadow-sm hover:shadow font-medium border-0"
                      >
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
        <TableLoading row={12} col={6} width={190} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.data?.content?.length > 0 ? (
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <TableContainer className="mb-0">
              <Table>
                <TableHeader>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <TableCell>{t("Trạng thái")}</TableCell>
                    <TableCell>{t("Ngày sinh")}</TableCell>
                    <TableCell>{t("Họ tên")}</TableCell>
                    <TableCell>{t("Email")}</TableCell>
                    <TableCell>{t("SĐT")}</TableCell>
                    <TableCell className="text-right">{t("Hành động")}</TableCell>
                  </tr>
                </TableHeader>
                <CustomerTable customers={data.data.content} />
              </Table>
              <TableFooter>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <PaginationInfo
                    currentPage={customerPage}
                    itemsPerPage={data.data.size}
                    totalItems={data.data.totalElements}
                    itemLabel="khách hàng"
                  />
                  <Pagination
                    totalResults={data.data.totalElements}
                    resultsPerPage={data.data.size}
                    onChange={(p) => handleChangePage(p, "customer")}
                    label="Table navigation"
                  />
                </div>
              </TableFooter>
            </TableContainer>
          </CardBody>
        </Card>
      ) : (
        <NotFound title={t("Không tìm thấy khách hàng nào.")} />
      )}
    </>
  );
};

export default Customers;