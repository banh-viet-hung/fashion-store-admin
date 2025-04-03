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
          <TableRow key={category.id}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name="category"
                id={String(category.id)}
                handleClick={handleClick}
                isChecked={isCheck?.includes(String(category.id))}
              />
            </TableCell>
            <TableCell className="font-semibold uppercase text-xs">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium text-sm">
              {category.name}
            </TableCell>
            <TableCell className="text-sm">{category.slug}</TableCell>
            <TableCell>
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
