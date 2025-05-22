import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Badge,
  Select,
} from "@windmill/react-ui";
import { FiPlus, FiTrash2, FiFilter, FiInfo, FiRefreshCw } from "react-icons/fi";

import useAsync from "@/hooks/useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import CategoryServices from "@/services/CategoryServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import CategoryDrawer from "@/components/drawer/CategoryDrawer";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import PaginationLoading from "@/components/preloader/PaginationLoading";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import CheckBox from "@/components/form/others/CheckBox";
import CategoryTable from "@/components/category/CategoryTable";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";

const Category = () => {
  const {
    toggleDrawer,
    lang,
    categoryPage,
    handleChangePage,
    pageLoading,
    setPageLoading,
    setCurrentPageType,
    isUpdate,
    setIsUpdate,
    setSortedField: setContextSortedField
  } = useContext(SidebarContext);

  const { t } = useTranslation();
  const { title, handleDeleteMany, allId, serviceId } = useToggleDrawer();

  const pageSize = 10;
  const [sortedField, setSortedField] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setCurrentPageType("category");
  }, [setCurrentPageType]);

  const { data, loading, error } = useAsync(() =>
    CategoryServices.getAllCategory(categoryPage - 1, pageSize, sortedField)
  );

  // Update context sortedField when local state changes
  useEffect(() => {
    setContextSortedField(sortedField);
  }, [sortedField, setContextSortedField]);

  useEffect(() => {
    if (data && !loading) {
      setPageLoading(false);
    }
  }, [data, loading, setPageLoading]);

  // Reset isUpdate state after data fetch
  useEffect(() => {
    if (isUpdate) {
      setIsUpdate(false);
    }
  }, [data, isUpdate, setIsUpdate]);

  const categories = data?._embedded?.category || [];
  const totalElements = data?.page?.totalElements || 0;
  const totalPages = data?.page?.totalPages || 0;

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = () => {
    const newIsCheckAll = !isCheckAll;
    setIsCheckAll(newIsCheckAll);
    setIsCheck(newIsCheckAll ? categories.map((cat) => String(cat.id)) : []);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setSortedField(e.target.value);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSortedField("");
  };

  // Generate filter summary text
  const getFilterSummary = () => {
    const summaries = [];

    if (sortedField) {
      let status = "";
      if (sortedField === "da_xoa") status = "Đã xóa";
      else status = "Tất cả";
      summaries.push(`Tình trạng: ${status}`);
    }

    return summaries;
  };

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (sortedField) count++;
    return count;
  };

  return (
    <>
      {pageLoading && <PaginationLoading />}
      <div className="flex justify-between items-center mb-4">
        <PageTitle>{t("Quản lý danh mục sản phẩm")}</PageTitle>
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
                onClick={handleResetFilters}
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

      {/* Filters panel */}
      <AnimatedContent>
        <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <Card className="min-w-0 shadow-sm bg-white dark:bg-gray-800 mb-4 border border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <FiFilter className="mr-2 h-4 w-4 text-emerald-500" />
                Lọc danh mục
              </h3>
              <Button
                layout="link"
                size="small"
                className="text-red-500 hover:text-red-700"
                onClick={handleResetFilters}
              >
                <span className="flex items-center gap-1">
                  <FiRefreshCw className="h-3.5 w-3.5" />
                  <span className="text-xs">Đặt lại</span>
                </span>
              </Button>
            </div>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Tình trạng
                  </label>
                  <Select
                    className="mt-1"
                    value={sortedField}
                    onChange={handleStatusChange}
                  >
                    <option value="">Tất cả</option>
                    <option value="da_xoa">Đã xóa</option>
                  </Select>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </AnimatedContent>

      <DeleteModal ids={allId} setIsCheck={setIsCheck} title={title} />
      <MainDrawer>
        <CategoryDrawer id={serviceId} data={data} lang={lang} />
      </MainDrawer>

      {loading ? (
        <div className="animate-pulse">
          <TableLoading row={12} col={6} width={190} height={20} />
        </div>
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : categories.length !== 0 ? (
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
                    <TableCell className="font-semibold text-xs uppercase">{t("STT")}</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">{t("Tên danh mục")}</TableCell>
                    <TableCell className="font-semibold text-xs uppercase">{t("Slug")}</TableCell>
                    <TableCell className="text-right font-semibold text-xs uppercase pr-4">{t("Hành động")}</TableCell>
                  </tr>
                </TableHeader>
                <CategoryTable
                  data={data}
                  lang={lang}
                  isCheck={isCheck}
                  categories={categories}
                  setIsCheck={setIsCheck}
                />
              </Table>
              <TableFooter>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <PaginationInfo
                    currentPage={categoryPage}
                    itemsPerPage={pageSize}
                    totalItems={totalElements || 0}
                    itemLabel="danh mục"
                  />
                  <Pagination
                    totalResults={totalElements}
                    resultsPerPage={pageSize}
                    onChange={(p) => handleChangePage(p, "category")}
                    label="Table navigation"
                  />
                </div>
              </TableFooter>
            </TableContainer>
          </CardBody>
        </Card>
      ) : (
        <NotFound title="Không có danh mục sản phẩm nào" />
      )}
    </>
  );
};

export default Category;
