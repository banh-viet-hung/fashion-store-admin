import React, { useContext, useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableCell,
  TableFooter,
  TableContainer,
  Select,
  Input,
  Button,
  Card,
  CardBody,
  Pagination,
  Badge,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiPlus, FiEdit, FiTrash2, FiFilter, FiRefreshCw, FiList, FiInfo, FiBox, FiTag } from "react-icons/fi";
import { IoSearch, IoClose, IoFilterOutline } from "react-icons/io5";

//internal import

import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import UploadMany from "@/components/common/UploadMany";
import NotFound from "@/components/table/NotFound";
import ProductServices from "@/services/ProductServices";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import ProductTable from "@/components/product/ProductTable";
import MainDrawer from "@/components/drawer/MainDrawer";
import AddProductDrawer from "@/components/drawer/AddProductDrawer";
import EditProductDrawer from "@/components/drawer/EditProductDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import useProductFilter from "@/hooks/useProductFilter";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import PaginationLoading from "@/components/preloader/PaginationLoading";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import SelectCategory from "@/components/form/selectOption/SelectCategory";
import AnimatedContent from "@/components/common/AnimatedContent";

const Products = () => {
  const { title, allId, serviceId, handleDeleteMany, handleUpdateMany } =
    useToggleDrawer();
  const { t } = useTranslation();
  const {
    toggleDrawer,
    lang,
    productPage,
    handleChangePage,
    searchText,
    setSearchText,
    category,
    setCategory,
    searchRef,
    handleSubmitForAll,
    sortedField,
    setSortedField,
    limitData,
    drawerType,
    productId,
    openEditDrawer,
    isDrawerOpen,
    setIsUpdate,
    isUpdate,
    pageLoading,
    setPageLoading,
    setCurrentPageType,
  } = useContext(SidebarContext);

  // Set the current page type when component mounts
  useEffect(() => {
    setCurrentPageType("product");
  }, [setCurrentPageType]);

  const { data, loading, error } = useAsync(() =>
    ProductServices.getAllProducts({
      page: productPage,
      limit: limitData,
      category: category,
      title: searchText,
      status: sortedField,
    })
  );

  // Turn off page loading after data is fetched
  useEffect(() => {
    if (data && !loading) {
      setPageLoading(false);
    }
  }, [data, loading, setPageLoading]);

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data?.content.map((li) => String(li.id))); // Chuyển id thành chuỗi
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleResetField = () => {
    setCategory(""); // Reset category
    setSortedField(""); // Reset status (sortedField)
    searchRef.current.value = ""; // Reset giá trị input
    setSearchText(""); // Reset searchText để title trong API thành rỗng
  };

  const {
    serviceData,
    filename,
    isDisabled,
    handleSelectFile,
    handleUploadMultiple,
    handleRemoveSelectFile,
  } = useProductFilter(data?.content); // Đổi products thành content

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchText) count++;
    if (category) count++;
    if (sortedField) count++;
    return count;
  };

  // Generate filter summary text
  const getFilterSummary = () => {
    const summaries = [];

    if (searchText) summaries.push(`Tên sản phẩm: ${searchText}`);
    if (category) summaries.push(`Danh mục: ${category}`);
    if (sortedField) {
      let status = "";
      if (sortedField === "con_hang") status = "Còn hàng";
      else if (sortedField === "het_hang") status = "Hết hàng";
      else if (sortedField === "da_xoa") status = "Đã xóa";
      summaries.push(`Trạng thái: ${status}`);
    }

    return summaries;
  };

  return (
    <>
      {pageLoading && <PaginationLoading />}
      <div className="flex justify-between items-center mb-4">
        <PageTitle>{t("Quản lý sản phẩm")}</PageTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => isCheck?.length > 0 && sortedField !== "da_xoa" && handleDeleteMany(isCheck, data?.content)}
            layout="outline"
            size="small"
            className={`flex items-center gap-1 rounded-lg border-gray-200 dark:border-gray-600 ${(isCheck?.length < 1 || sortedField === "da_xoa") ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-300'}`}
          >
            <FiTrash2 className={`h-4 w-4 ${(isCheck?.length < 1 || sortedField === "da_xoa") ? 'text-gray-400' : 'text-red-600'}`} />
            <span className={`hidden md:inline-block ${(isCheck?.length < 1 || sortedField === "da_xoa") ? 'text-gray-400' : 'text-red-600'}`}>
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
            <span className="hidden md:inline-block">{t("Thêm mới")}</span>
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
        </div>
      </div>

      <DeleteModal ids={allId} setIsCheck={setIsCheck} title={title} />
      <MainDrawer>
        {drawerType === "add" ? (
          <AddProductDrawer />
        ) : (
          <EditProductDrawer id={productId} />
        )}
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
                Lọc sản phẩm
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
              <form onSubmit={handleSubmitForAll} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Cột 1: Tìm kiếm theo tên */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <IoSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Input
                        ref={searchRef}
                        type="search"
                        name="search"
                        placeholder="Nhập tên sản phẩm"
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      />
                    </div>
                  </div>

                  {/* Cột 2: Danh mục */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiTag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="pl-10">
                        <SelectCategory setCategory={setCategory} lang={lang} className="focus:ring-2 focus:ring-emerald-500 rounded-lg h-10" />
                      </div>
                    </div>
                  </div>

                  {/* Cột 3: Trạng thái */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiBox className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <Select
                        onChange={(e) => setSortedField(e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-emerald-500 rounded-lg h-10"
                      >
                        <option value="" defaultValue hidden>
                          {t("Tình trạng")}
                        </option>
                        <option value="con_hang">{t("Còn hàng")}</option>
                        <option value="het_hang">{t("Hết hàng")}</option>
                        <option value="da_xoa">{t("Đã xóa")}</option>
                      </Select>
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
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.content?.length !== 0 ? (
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
                        isChecked={isCheckAll}
                        handleClick={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-xs uppercase">{t("Tên sản phẩm")}</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">{t("Giá gốc")}</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">Giá khuyến mãi</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">{t("Số lượng")}</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">{t("Trạng thái")}</TableCell>
                    <TableCell className="text-right font-semibold text-xs uppercase pr-4">{t("Hành động")}</TableCell>
                  </tr>
                </TableHeader>
                <ProductTable
                  lang={lang}
                  isCheck={isCheck}
                  products={data?.content}
                  setIsCheck={setIsCheck}
                />
              </Table>
              <TableFooter>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <PaginationInfo
                    currentPage={productPage}
                    itemsPerPage={limitData}
                    totalItems={data?.totalElements || 0}
                    itemLabel="sản phẩm"
                  />
                  <Pagination
                    totalResults={data?.totalElements}
                    resultsPerPage={limitData}
                    onChange={(p) => handleChangePage(p, "product")}
                    label="Product Page Navigation"
                  />
                </div>
              </TableFooter>
            </TableContainer>
          </CardBody>
        </Card>
      ) : (
        <NotFound title="Product" />
      )}
    </>
  );
};

export default Products;
