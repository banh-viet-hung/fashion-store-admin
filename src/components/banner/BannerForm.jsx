import React from 'react';
import { Input, Label, Button } from '@windmill/react-ui';
import { useTranslation } from 'react-i18next';

//internal import
import Error from '@/components/form/others/Error';
import InputArea from '@/components/form/input/InputArea';
import SwitchToggle from '@/components/form/switch/SwitchToggle';
import Uploader from '@/components/image-uploader/Uploader';

const BannerForm = ({
    register,
    errors,
    banner,
    isSubmitting,
    onSubmit,
    handleSubmit,
    imageUrl,
    setImageUrl,
    isActive,
    setIsActive,
    selectedType,
    imageError,
    setImageError,
    setSelectedFile,
}) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <label className="block text-sm text-gray-700 dark:text-gray-400 col-span-4 sm:col-span-2 font-medium">
                    Hình ảnh banner <span className="text-red-500">*</span>
                </label>
                <div className="col-span-8 sm:col-span-4">
                    <Uploader
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        title="Hình ảnh banner"
                        onChange={() => setImageError("")}
                        product={false}
                        setSelectedFile={setSelectedFile}
                    />
                    <p className="text-xs text-gray-500 mt-1">Chỉ được phép tải lên 1 ảnh cho mỗi banner</p>
                    {imageError && (
                        <p className="text-xs text-red-500 mt-1">{imageError}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <label className="block text-sm text-gray-700 dark:text-gray-400 col-span-4 sm:col-span-2 font-medium">
                    Tên banner <span className="text-red-500">*</span>
                </label>
                <div className="col-span-8 sm:col-span-4">
                    <InputArea
                        register={register}
                        label="Tên banner"
                        name="name"
                        type="text"
                        placeholder="Nhập tên banner"
                        required={true}
                    />
                    <Error errorName={errors.name} />
                </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <label className="block text-sm text-gray-700 dark:text-gray-400 col-span-4 sm:col-span-2 font-medium">
                    Đường dẫn <span className="text-red-500">*</span>
                </label>
                <div className="col-span-8 sm:col-span-4">
                    <InputArea
                        register={register}
                        label="Đường dẫn"
                        name="link"
                        type="text"
                        placeholder="Nhập đường dẫn khi nhấp vào banner"
                        required={true}
                    />
                    <Error errorName={errors.link} />
                </div>
            </div>

            <input
                type="hidden"
                {...register("type")}
            />

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <label className="block text-sm text-gray-700 dark:text-gray-400 col-span-4 sm:col-span-2 font-medium">
                    Trạng thái
                </label>
                <div className="col-span-8 sm:col-span-4">
                    <SwitchToggle
                        handleProcess={setIsActive}
                        processOption={isActive}
                    />
                </div>
            </div>

            <div className="flex flex-row-reverse mt-8">
                <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="h-12 px-6"
                >
                    {banner ? "Cập nhật" : "Lưu"}
                </Button>
            </div>
        </form>
    );
};

export default BannerForm; 