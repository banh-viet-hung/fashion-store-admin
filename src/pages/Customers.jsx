import React, { useRef, useContext, useEffect } from "react";
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
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import CustomerTable from "@/components/customer/CustomerTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import CustomerServices from "@/services/CustomerServices";
import AnimatedContent from "@/components/common/AnimatedContent";
import { SidebarContext } from "@/context/SidebarContext";

const Customers = () => {
  const { t } = useTranslation();
  const {
    currentPage,
    setCurrentPage,
    searchText,
    setSearchText,
    resultsPerPage,
  } = useContext(SidebarContext);
  const userRef = useRef(null);

  const asyncFunction = async ({ cancelToken }) => {
    const page = currentPage;
    const size = 5;
    const email = searchText || "";
    return CustomerServices.getAllCustomers({ page, size, email, cancelToken });
  };

  const { data, loading, error } = useAsync(asyncFunction);

  // Reset trạng thái khi vào trang Customer
  useEffect(() => {
    setSearchText(""); // Reset searchText về rỗng
    setCurrentPage(1); // Reset currentPage về 1
  }, [setSearchText, setCurrentPage]);

  const handleSubmitUser = (e) => {
    e.preventDefault();
    setSearchText(userRef.current.value);
    setCurrentPage(1);
  };

  const handleResetField = () => {
    setSearchText("");
    setCurrentPage(1);
    if (userRef.current) userRef.current.value = "";
  };

  const handleChangePage = (p) => {
    setCurrentPage(p);
  };

  return (
    <>
      <PageTitle>{t("Quản lý khách hàng")}</PageTitle>

      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form
              onSubmit={handleSubmitUser}
              className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex"
            >
              <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <Input
                  ref={userRef}
                  type="search"
                  name="search"
                  placeholder={t("Nhập email khách hàng")}
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
                    className="px-4 md:py-1 py-2 h-12 text-sm dark:bg-gray-700"
                  >
                    <span className="text-black dark:text-gray-200">
                      Hoàn tác
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </AnimatedContent>

      {loading ? (
        <TableLoading row={12} col={6} width={190} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.data?.content?.length > 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
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
            <Pagination
              totalResults={data.data.totalElements}
              resultsPerPage={data.data.size}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no customers right now." />
      )}
    </>
  );
};

export default Customers;