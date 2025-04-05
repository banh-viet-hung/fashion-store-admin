import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

import CheckBox from "@/components/form/others/CheckBox";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import CategoryDrawer from "@/components/drawer/CategoryDrawer";
import EditDeleteButton from "@/components/table/EditDeleteButton";

const CategoryTable = ({ data, lang, isCheck, categories, setIsCheck }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter((item) => item !== id);
      }
    });
  };

  return (
    <>
      {isCheck?.length < 1 && <DeleteModal id={serviceId} title={title} />}

      <MainDrawer>
        <CategoryDrawer id={serviceId} data={data} lang={lang} />
      </MainDrawer>

      <TableBody>
        {categories?.map((category, index) => (
          <TableRow key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150">
            <TableCell className="pl-4 py-3">
              <CheckBox
                type="checkbox"
                name="category"
                id={String(category.id)}
                handleClick={handleClick}
                isChecked={isCheck?.includes(String(category.id))}
              />
            </TableCell>
            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {index + 1}
            </TableCell>
            <TableCell className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {category.name}
            </TableCell>
            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
              {category.slug}
            </TableCell>
            <TableCell className="text-right pr-4">
              <EditDeleteButton
                id={category.id}
                title={category.name}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default CategoryTable;
