import {
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableBody
} from "@windmill/react-ui";
import React from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";
import Multiselect from "multiselect-react-dropdown";
import { FiTrash, FiArrowRight } from "react-icons/fi";

// Internal imports
import useAddProductSubmit from "@/hooks/useAddProductSubmit";
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";

const AddProductDrawer = () => {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    categories,
    colors,
    sizes,
    selectedCategories,
    selectedColors,
    selectedSizes,
    handleCategoryChange,
    handleColorChange,
    handleSizeChange,
    imageUrls,
    handleImageUpload,
    removeImage,
    activeTab,
    handleTabChange,
    productVariants,
    updateVariantQuantity,
    handleContinueToVariants
  } = useAddProductSubmit();
  
  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Title
          title={t("Thêm sản phẩm mới")}
          description={t("Điền các thông tin để tạo sản phẩm mới")}
        />
      </div>
      
      {/* Tabs */}
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange("basic");
              }}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "basic"
                  ? "text-emerald-600 border-b-2 border-emerald-600 active"
                  : "border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              {t("Thông tin cơ bản")}
            </a>
          </li>
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleContinueToVariants();
              }}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "variants"
                  ? "text-emerald-600 border-b-2 border-emerald-600 active"
                  : "border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              {t("Kho hàng")}
            </a>
          </li>
        </ul>
      </div>
      
      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="block">
          {activeTab === "basic" && (
            <div className="px-6 pt-8 flex-grow w-full h-full max-h-full pb-40 md:pb-32 lg:pb-32 xl:pb-32">
              {/* Tên sản phẩm */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Tên sản phẩm")} />
                <div className="col-span-8 sm:col-span-4">
                  <Input
                    {...register("name", {
                      required: "Tên sản phẩm là bắt buộc!",
                    })}
                    className="border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white"
                    name="name"
                    type="text"
                    placeholder={t("Nhập tên sản phẩm")}
                  />
                  <Error errorName={errors.name} />
                </div>
              </div>
              
              {/* Mô tả sản phẩm */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Mô tả sản phẩm")} />
                <div className="col-span-8 sm:col-span-4">
                  <Textarea
                    className="border text-sm focus:outline-none block w-full bg-gray-100 border-transparent focus:bg-white"
                    {...register("description")}
                    name="description"
                    placeholder={t("Mô tả chi tiết sản phẩm")}
                    rows="4"
                    spellCheck="false"
                  />
                  <Error errorName={errors.description} />
                </div>
              </div>
              
              {/* Giá gốc */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Giá gốc")} />
                <div className="col-span-8 sm:col-span-4">
                  <Input
                    {...register("price", {
                      required: "Giá gốc là bắt buộc!",
                      min: {
                        value: 1000,
                        message: "Giá gốc phải từ 1.000 trở lên!",
                      },
                    })}
                    className="border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white"
                    name="price"
                    type="number"
                    placeholder={t("Nhập giá gốc")}
                  />
                  <Error errorName={errors.price} />
                </div>
              </div>
              
              {/* Giá khuyến mãi */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Giá khuyến mãi (Tùy chọn)")} />
                <div className="col-span-8 sm:col-span-4">
                  <Input
                    {...register("salePrice", {
                      min: {
                        value: 0,
                        message: "Giá khuyến mãi phải từ 0 trở lên!",
                      },
                    })}
                    className="border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white"
                    name="salePrice"
                    type="number"
                    placeholder={t("Nhập giá khuyến mãi")}
                  />
                  <Error errorName={errors.salePrice} />
                </div>
              </div>
              
              {/* Danh mục */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Danh mục")} />
                <div className="col-span-8 sm:col-span-4">
                  <Multiselect
                    options={categories || []}
                    displayValue="name"
                    onSelect={handleCategoryChange}
                    onRemove={handleCategoryChange}
                    selectedValues={selectedCategories}
                    placeholder={t("Chọn danh mục sản phẩm")}
                  />
                </div>
              </div>
              
              {/* Màu sắc */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Màu sắc (Tùy chọn)")} />
                <div className="col-span-8 sm:col-span-4">
                  <Multiselect
                    options={colors || []}
                    displayValue="name"
                    onSelect={handleColorChange}
                    onRemove={handleColorChange}
                    selectedValues={selectedColors}
                    placeholder={t("Chọn màu sắc sản phẩm")}
                    customCloseIcon={<></>}
                    style={{
                      chips: { background: "#059669" },
                      optionContainer: { border: "1px solid #e9e9e9" }
                    }}
                  />
                </div>
              </div>
              
              {/* Kích thước */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Kích thước (Tùy chọn)")} />
                <div className="col-span-8 sm:col-span-4">
                  <Multiselect
                    options={sizes || []}
                    displayValue="name"
                    onSelect={handleSizeChange}
                    onRemove={handleSizeChange}
                    selectedValues={selectedSizes}
                    placeholder={t("Chọn kích thước sản phẩm")}
                    customCloseIcon={<></>}
                    style={{
                      chips: { background: "#059669" },
                      optionContainer: { border: "1px solid #e9e9e9" }
                    }}
                  />
                </div>
              </div>
              
              {/* Hình ảnh sản phẩm */}
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("Hình ảnh sản phẩm")} />
                <div className="col-span-8 sm:col-span-4">
                  <div className="w-full text-center">
                    <div className="border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer px-6 pt-5 pb-6" onClick={() => document.getElementById('fileInput').click()}>
                      <input
                        id="fileInput"
                        type="file"
                        multiple
                        accept="image/*,.jpeg,.jpg,.png,.gif,.webp"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                      <span className="mx-auto flex justify-center">
                        <svg
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-3xl text-emerald-500"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <polyline points="16 16 12 12 8 16"></polyline>
                          <line x1="12" y1="12" x2="12" y2="21"></line>
                          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                          <polyline points="16 16 12 12 8 16"></polyline>
                        </svg>
                      </span>
                      <p className="text-sm mt-2">{t("Kéo thả hình ảnh hoặc click để chọn")}</p>
                      <em className="text-xs text-gray-400">
                        {t("(Hỗ trợ định dạng: jpeg, jpg, png, gif, webp. Tối đa 6 hình)")}
                      </em>
                    </div>
                    
                    {imageUrls.length > 0 && (
                      <aside className="flex flex-row flex-wrap mt-4">
                        {imageUrls.map((image, index) => (
                          <div key={index} className="relative w-24 h-24 mr-2 mb-2 border rounded-md overflow-hidden">
                            <img 
                              src={image.preview} 
                              alt={`preview ${index}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                              onClick={() => removeImage(index)}
                            >
                              <FiTrash />
                            </button>
                          </div>
                        ))}
                      </aside>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleContinueToVariants}
                  className="h-12 px-6"
                >
                  {t("Tiếp tục")} <FiArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === "variants" && (
            <div className="px-6 pt-8 flex-grow w-full h-full max-h-full pb-40 md:pb-32 lg:pb-32 xl:pb-32">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">{t("Số lượng theo biến thể")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedColors.length === 0 && selectedSizes.length === 0 
                    ? t("Nhập tổng số lượng sản phẩm") 
                    : t("Nhập số lượng cho từng biến thể của sản phẩm")}
                </p>
                
                <Table className="w-full whitespace-nowrap">
                  <TableHeader>
                    <TableRow>
                      <TableCell>{t("STT")}</TableCell>
                      <TableCell>{t("Màu sắc")}</TableCell>
                      <TableCell>{t("Kích thước")}</TableCell>
                      <TableCell>{t("Số lượng")}</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productVariants.map((variant, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <span className="text-sm">{index + 1}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{variant.colorName || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{variant.sizeName || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="border h-10 text-sm focus:outline-none block w-24 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white"
                            type="number"
                            min="0"
                            value={variant.quantity}
                            onChange={(e) => updateVariantQuantity(index, e.target.value)}
                            placeholder="0"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    layout="outline" 
                    onClick={() => handleTabChange("basic")}
                    className="h-12 px-6"
                  >
                    {t("Quay lại")}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DrawerButton title="Sản phẩm" isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default React.memo(AddProductDrawer); 