import { Select } from "@windmill/react-ui";
import React from "react";
import { useTranslation } from "react-i18next";
import useAsync from "@/hooks/useAsync";
import CategoryServices from "@/services/CategoryServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const SelectCategory = ({ setCategory }) => {
  const { t } = useTranslation();
  const { data } = useAsync(CategoryServices.getAllCategories);
  const { showingTranslateValue } = useUtilsFunction();

  // in ra console danh sách các category
  console.log("data", data);

  return (
    <>
      <Select onChange={(e) => setCategory(e.target.value)}>
        <option value="" defaultValue hidden>
          {t("Danh mục")}
        </option>
        {data?.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </Select>
    </>
  );
};

export default SelectCategory;
