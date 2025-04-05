import { Input } from "@windmill/react-ui";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Scrollbars from "react-custom-scrollbars-2";
import { FiBox, FiLink } from "react-icons/fi";

//internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import useCategorySubmit from "@/hooks/useCategorySubmit";
import CategoryServices from "@/services/CategoryServices";

const CategoryDrawer = ({ id, data }) => {
  const { t } = useTranslation();

  const { register, handleSubmit, onSubmit, errors, isSubmitting } =
    useCategorySubmit(id, data);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Lấy thông tin danh mục khi chỉnh sửa
  useEffect(() => {
    if (id) {
      CategoryServices.getCategoryById(id)
        .then((res) => {
          setName(res.name);
          setSlug(res.slug);
        })
        .catch((err) => console.error("Error fetching category:", err));
    }
  }, [id]);

  // Tự động sinh slug khi thay đổi name
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    const generatedSlug = newName.toLowerCase().replace(/\s+/g, "-");
    setSlug(generatedSlug);
  };

  // Cho phép chỉnh sửa slug thủ công
  const handleSlugChange = (e) => {
    setSlug(e.target.value);
  };

  // Gửi dữ liệu với slug
  const onSubmitWrapper = (data) => {
    onSubmit({ name, slug });
  };

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title title={t("Cập nhật danh mục")} />
        ) : (
          <Title title={t("Thêm danh mục")} />
        )}
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmitWrapper)} className="block">
          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("Tên danh mục")} />
              <div className="col-span-8 sm:col-span-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiBox className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <Input
                    required={true}
                    value={name}
                    onChange={handleNameChange}
                    type="text"
                    placeholder={t("Vd: Quần nam")}
                    className="pl-10 border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-white dark:text-gray-800 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0"
                  />
                </div>
                <Error errorName={errors.name} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("Slug")} />
              <div className="col-span-8 sm:col-span-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <Input
                    value={slug}
                    onChange={handleSlugChange}
                    type="text"
                    placeholder={t("Vd: quan-nam")}
                    className="pl-10 border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-white dark:text-gray-800 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0"
                  />
                </div>
                <Error errorName={errors.slug} />
              </div>
            </div>
          </div>

          <DrawerButton id={id} title="danh mục" isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default CategoryDrawer;
