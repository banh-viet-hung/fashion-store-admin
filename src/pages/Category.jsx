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
} from "@windmill/react-ui";
import { FiPlus, FiTrash2 } from "react-icons/fi";

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

  const pageSize = 20;

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
      <PageTitle>{t("Quản lý danh mục sản phẩm")}</PageTitle>
      <DeleteModal ids={allId} setIsCheck={setIsCheck} title={title} />

      <MainDrawer>
        <CategoryDrawer id={serviceId} data={data} lang={lang} />
      </MainDrawer>

      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form className="py-3 grid gap-4 lg:gap-6 xl:gap-6 xl:flex">
              <div className="flex-grow-0 sm:flex-grow md:flex-grow lg:flex-grow xl:flex-grow" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                  <Button
                    disabled={isCheck.length < 1}
                    onClick={() => handleDeleteMany(isCheck)}
                    className="w-full rounded-md h-12 bg-red-300 disabled btn-red"
                  >
                    <span className="mr-2">
                      <FiTrash2 />
                    </span>
                    {t("Xóa danh mục")}
                  </Button>
                </div>
                <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                  <Button
                    onClick={toggleDrawer}
                    className="w-full rounded-md h-12"
                  >
                    <span className="mr-2">
                      <FiPlus />
                    </span>
                    {t("Thêm danh mục")}
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
      ) : categories.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    handleClick={handleSelectAll}
                    isChecked={isCheckAll}
                  />
                </TableCell>
                <TableCell>{t("STT")}</TableCell>
                <TableCell>{t("Tên danh mục")}</TableCell>
                <TableCell>{t("Slug")}</TableCell>
                <TableCell className="text-right">{t("Hành động")}</TableCell>
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
            <Pagination
              totalResults={totalElements}
              resultsPerPage={pageSize}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no categories right now." />
      )}
    </>
  );
};

export default Category;
