import { useContext, useState } from "react";
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
} from "@windmill/react-ui";
import { FiPlus, FiTrash2, FiFilter, FiInfo } from "react-icons/fi";

import useAsync from "@/hooks/useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import CategoryServices from "@/services/CategoryServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import CategoryDrawer from "@/components/drawer/CategoryDrawer";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import CheckBox from "@/components/form/others/CheckBox";
import CategoryTable from "@/components/category/CategoryTable";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";

const Category = () => {
  const { toggleDrawer, lang, currentPage, handleChangePage } =
    useContext(SidebarContext);
  const { t } = useTranslation();
  const { title, handleDeleteMany, allId, serviceId } = useToggleDrawer();

  const pageSize = 10;

  const { data, loading, error } = useAsync(() =>
    CategoryServices.getAllCategory(currentPage - 1, pageSize)
  );

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

  return (
    <>
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
        </div>
      </div>

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
                  data={categories}
                  lang={lang}
                  isCheck={isCheck}
                  categories={categories}
                  setIsCheck={setIsCheck}
                />
              </Table>
              <TableFooter>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Hiển thị {categories.length || 0} trên {totalElements || 0} danh mục
                  </div>
                  <Pagination
                    totalResults={totalElements}
                    resultsPerPage={pageSize}
                    onChange={handleChangePage}
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
