import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import CategoryServices from "@/services/CategoryServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useCategorySubmit = (id, data) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate } = useContext(SidebarContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const categoryData = {
        name: data.name,
        slug: data.slug,
      };

      if (id) {
        const res = await CategoryServices.updateCategory(id, categoryData);
        setIsUpdate(true);
        notifySuccess("Cập nhật danh mục thành công!");
        closeDrawer();
      } else {
        const res = await CategoryServices.addCategory(categoryData);
        setIsUpdate(true);
        notifySuccess("Thêm danh mục thành công!");
        closeDrawer();
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setValue("name", "");
      setValue("slug", "");
      clearErrors("name");
      clearErrors("slug");
    }
  }, [isDrawerOpen, setValue, clearErrors]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
  };
};

export default useCategorySubmit;
