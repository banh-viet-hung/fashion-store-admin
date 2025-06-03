import React from 'react';
import { Input, Label, Button } from '@windmill/react-ui';
import { useTranslation } from 'react-i18next';

//internal import
import Error from '@/components/form/others/Error';
import InputArea from '@/components/form/input/InputArea';
import SwitchToggle from '@/components/form/switch/SwitchToggle';
import BannerUploader from '@/components/image-uploader/BannerUploader';

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
                    <BannerUploader
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        title="Hình ảnh banner"
                        onChange={() => setImageError("")}
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
                        placeholder="Tên banner"
                        required="Tên banner là bắt buộc"
                    />
                    <Error errorName={errors.name} />
                </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <label className="block text-sm text-gray-700 dark:text-gray-400 col-span-4 sm:col-span-2 font-medium">
                    Liên kết (URL) <span className="text-red-500">*</span>
                </label>
                <div className="col-span-8 sm:col-span-4">
                    <InputArea
                        register={register}
                        label="Liên kết"
                        name="link"
                        type="text"
                        placeholder="Liên kết banner"
                        required="Liên kết là bắt buộc"
                    />
                    <p className="text-xs text-gray-500 mt-1">Đường dẫn đến trang đích khi người dùng nhấp vào banner</p>
                    <Error errorName={errors.link} />
                </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <label className="block text-sm text-gray-700 dark:text-gray-400 col-span-4 sm:col-span-2 font-medium">
                    Trạng thái
                </label>
                <div className="col-span-8 sm:col-span-4">
                    <SwitchToggle
                        title="Hiển thị banner"
                        handleProcess={setIsActive}
                        processOption={isActive}
                    />
                    <p className="text-xs text-gray-500 mt-1">Bật để hiển thị banner trên trang web</p>
                </div>
            </div>

            <div className="flex flex-row-reverse pb-6">
                <Button
                    type="submit"
                    className="h-12 px-6"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Đang lưu..." : banner?.id ? "Cập nhật" : "Lưu"}
                </Button>
            </div>
        </form>
    );
};

export default BannerForm; 