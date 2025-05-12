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
  Badge,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiPlus, FiFilter, FiSearch, FiInfo, FiUsers } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

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
  const [showFilters, setShowFilters] = useState(false);
  const userRef = useRef(null);

  // Lấy danh sách roles
  const { data: rolesData, loading: rolesLoading, error: rolesError } = useAsync(
    AdminServices.getAllRoles
  );

  // Hàm gọi API thông qua useAsync
  const asyncFunction = async ({ cancelToken }) => {
    return AdminServices.getAllStaff({
      page: currentPage,
      size: 3,
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

  // Kiểm tra nếu có bộ lọc active
  const hasActiveFilters = () => {
    return searchText || (selectedRole && selectedRole !== "STAFF");
  };

  // Hiển thị/ẩn bộ lọc
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <PageTitle>{t("Quản lý nhân viên")}</PageTitle>
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
                {searchText && selectedRole !== "STAFF" ? "2" : "1"}
              </Badge>
            )}
          </Button>
          <Button
            layout="outline"
            size="small"
            className="flex items-center gap-1 rounded-lg border-gray-200 dark:border-gray-600"
            onClick={handleAddStaffClick}
          >
            <FiPlus className="h-4 w-4" />
            <span className="hidden md:inline-block">{t("Thêm nhân viên")}</span>
          </Button>
        </div>
      </div>

      <MainDrawer>
        <AddStaffDrawer />
      </MainDrawer>

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
              {selectedRole && selectedRole !== "STAFF" && (
                <Badge type="info" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 px-2 py-0.5 text-xs flex items-center">
                  Role: {selectedRole}
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
                Lọc nhân viên
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
                        placeholder={t("Nhập email nhân viên")}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      />
                    </div>
                  </div>

                  {/* Cột 2: Chọn Role */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiUsers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      {rolesLoading ? (
                        <Select disabled className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10">
                          <option>Loading...</option>
                        </Select>
                      ) : rolesError ? (
                        <span className="text-red-500">{rolesError}</span>
                      ) : (
                        <Select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
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

                    <div className="flex justify-end gap-3 mt-2">
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
        <TableLoading row={12} col={7} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.data?.content?.length > 0 ? (
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <TableContainer className="mb-0">
              <Table>
                <TableHeader>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <TableCell>{t("Họ tên")}</TableCell>
                    <TableCell>{t("Email")}</TableCell>
                    <TableCell>{t("SĐT")}</TableCell>
                    <TableCell>{t("Ngày sinh")}</TableCell>
                    <TableCell>{t("Chức vụ")}</TableCell>
                    <TableCell className="text-center">{t("Trạng thái")}</TableCell>
                    <TableCell className="text-center">{t("Hành động")}</TableCell>
                  </tr>
                </TableHeader>
                <StaffTable staffs={data.data.content} lang={lang} />
              </Table>
              <TableFooter>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Hiển thị {data.data.content.length} trên {data.data.totalElements} nhân viên
                  </div>
                  <Pagination
                    totalResults={data.data.totalElements}
                    resultsPerPage={data.data.size}
                    onChange={handleChangePage}
                    label="Table navigation"
                  />
                </div>
              </TableFooter>
            </TableContainer>
          </CardBody>
        </Card>
      ) : (
        <NotFound title="Không tìm thấy nhân viên nào." />
      )}
    </>
  );
};

export default Staff;