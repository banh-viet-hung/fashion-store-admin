import { useState, useRef, useContext, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";

import useAsync from "@/hooks/useAsync";
import MainDrawer from "@/components/drawer/MainDrawer";
import AddStaffDrawer from "@/components/drawer/AddStaffDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import StaffTable from "@/components/staff/StaffTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import AdminServices from "@/services/AdminServices";
import AnimatedContent from "@/components/common/AnimatedContent";

const Staff = () => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const {
    toggleDrawer,
    lang,
    currentPage,
    setCurrentPage,
    setIsUpdate,
    searchText,
    setSearchText,
    isDrawerOpen,
  } = useContext(SidebarContext);
  const { t } = useTranslation();

  // Trạng thái cục bộ
  const [selectedRole, setSelectedRole] = useState("STAFF");
  const userRef = useRef(null);

  // Lấy danh sách roles
  const { data: rolesData, loading: rolesLoading, error: rolesError } = useAsync(
    AdminServices.getAllRoles
  );

  // Hàm gọi API thông qua useAsync
  const asyncFunction = async ({ cancelToken }) => {
    return AdminServices.getAllStaff({
      page: currentPage,
      size: 5,
      email: searchText,
      roleName: selectedRole,
      cancelToken,
    });
  };

  const { data, loading, error } = useAsync(asyncFunction);

  // Reset trạng thái khi vào trang Staff
  useEffect(() => {
    setSearchText(""); // Reset searchText về rỗng
    setCurrentPage(1); // Reset currentPage về 1
    setIsUpdate(true); // Kích hoạt useAsync gọi lại API với trạng thái mới
  }, [setSearchText, setCurrentPage, setIsUpdate]);

  // Xử lý khi submit form (Áp dụng)
  const handleSubmitUser = (e) => {
    e.preventDefault();
    const newSearchText = userRef.current.value;
    setSearchText(newSearchText);
    setCurrentPage(1); // Reset về trang 1
    setIsUpdate(true); // Buộc useAsync gọi lại API
  };

  // Xử lý khi reset (Hoàn tác)
  const handleResetField = () => {
    setSearchText("");
    setSelectedRole("STAFF");
    setCurrentPage(1); // Reset về trang 1
    setIsUpdate(true); // Buộc useAsync gọi lại API
    if (userRef.current) userRef.current.value = "";
  };

  // Xử lý thay đổi trang
  const handleChangePage = (p) => {
    setCurrentPage(p);
    setIsUpdate(true); // Buộc useAsync gọi lại API khi đổi trang
  };

  const handleAddStaffClick = () => {
    toggleDrawer();
  };

  return (
    <>
      <PageTitle>{t("Quản lý nhân viên")}</PageTitle>
      
      <MainDrawer>
        <AddStaffDrawer />
      </MainDrawer>

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
                  placeholder={t("Nhập email nhân viên")}
                />
              </div>
              <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                {rolesLoading ? (
                  <Select disabled>
                    <option>Loading...</option>
                  </Select>
                ) : rolesError ? (
                  <span className="text-red-500">{rolesError}</span>
                ) : (
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {rolesData?._embedded?.role
                      ?.filter((role) => role.name !== "USER")
                      .map((role) => (
                        <option key={role.name} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                  </Select>
                )}
              </div>

              <div className="mt-2 md:mt-0 flex items-center xl:gap-x-4 gap-x-1 flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <div className="w-full mx-1">
                  <Button type="submit" className="h-12 w-full bg-emerald-700">
                    Áp dụng
                  </Button>
                </div>

                <div className="w-full">
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

              <div className="w-full md:w-56 lg:w-56 xl:w-56">
                <Button
                  onClick={handleAddStaffClick}
                  className="w-full rounded-md h-12"
                >
                  <span className="mr-3">
                    <FiPlus />
                  </span>
                  {t("Thêm nhân viên")}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </AnimatedContent>

      {loading ? (
        <TableLoading row={12} col={7} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.data?.content?.length > 0 ? (
        <TableContainer className="mb-8 rounded-b-lg">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>{t("Họ tên")}</TableCell>
                <TableCell>{t("Email")}</TableCell>
                <TableCell>{t("SĐT")}</TableCell>
                <TableCell>{t("Ngày sinh")}</TableCell>
                <TableCell>{t("ROLE")}</TableCell>
                <TableCell className="text-center">{t("Trạng thái")}</TableCell>
                <TableCell className="text-center">{t("Hành động")}</TableCell>
              </tr>
            </TableHeader>
            <StaffTable staffs={data.data.content} lang={lang} />
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
        <NotFound title="Sorry, There are no staff right now." />
      )}
    </>
  );
};

export default Staff;