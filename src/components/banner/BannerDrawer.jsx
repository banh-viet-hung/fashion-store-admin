import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useTranslation } from 'react-i18next';
import { notifySuccess, notifyError } from '@/utils/toast';

// internal imports
import Title from '@/components/form/others/Title';
import Error from '@/components/form/others/Error';
import BannerServices from '@/services/BannerServices';
import BannerForm from '@/components/banner/BannerForm';
import BannerUploadService from '@/services/BannerUploadService';
import { SidebarContext } from '@/context/SidebarContext';

const BannerDrawer = ({ current = {}, handleUpdate, selectedType = 'slider' }) => {
    const { t } = useTranslation();
    const { closeDrawer } = useContext(SidebarContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [imageError, setImageError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm();

    // Hàm upload file lên server
    const uploadImageToServer = async (file) => {
        try {
            if (!file) return null;

            // Sử dụng BannerUploadService để tải ảnh lên server
            const imageUrl = await BannerUploadService.uploadBannerImage(file);
            return imageUrl;
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            throw new Error("Không thể tải ảnh lên server");
        }
    };

    const onSubmit = async (data) => {
        try {
            // Kiểm tra xem có file được chọn hoặc đã có ảnh sẵn
            if (!selectedFile && !imageUrl && !current.img) {
                setImageError('Vui lòng chọn hình ảnh cho banner');
                return;
            }

            setIsSubmitting(true);

            // Upload ảnh nếu có file mới được chọn
            let finalImageUrl = imageUrl;

            if (selectedFile) {
                try {
                    finalImageUrl = await uploadImageToServer(selectedFile);
                    if (!finalImageUrl) {
                        notifyError("Lỗi khi tải ảnh lên server");
                        setIsSubmitting(false);
                        return;
                    }
                } catch (error) {
                    notifyError("Lỗi khi tải ảnh lên server");
                    setIsSubmitting(false);
                    return;
                }
            }

            const bannerData = {
                name: data.name,
                link: data.link,
                img: finalImageUrl || current.img,
                active: isActive,
                type: current.type || selectedType,
            };

            console.log('Submitting banner data:', bannerData);

            let response;
            if (current?.id) {
                response = await BannerServices.updateBanner(current.id, bannerData);
                console.log('Update response:', response);
                if (response.success || response.status) {
                    notifySuccess("Cập nhật banner thành công");
                    handleUpdate(response.data);
                    closeDrawer();
                    setIsSubmitting(false);
                } else {
                    notifyError(response.message || "Lỗi khi cập nhật banner");
                    setIsSubmitting(false);
                }
            } else {
                response = await BannerServices.addBanner(bannerData);
                console.log('Add response:', response);
                if (response.success || response.status) {
                    notifySuccess("Thêm banner thành công");
                    handleUpdate();
                    closeDrawer();
                    setIsSubmitting(false);
                } else {
                    notifyError(response.message || "Lỗi khi thêm banner");
                    setIsSubmitting(false);
                }
            }
        } catch (error) {
            console.error('Error in banner submission:', error);
            setIsSubmitting(false);
            notifyError("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    useEffect(() => {
        if (current?.id) {
            setValue('name', current.name);
            setValue('link', current.link);
            setValue('type', current.type);
            setImageUrl(current.img);
            setIsActive(current.active);
        } else {
            setValue('name', '');
            setValue('link', '');
            setValue('type', selectedType);
            setImageUrl('');
            setIsActive(true);
        }

        return () => {
            clearErrors();
            setImageError('');
        };
    }, [current, setValue, clearErrors, selectedType]);

    // Hàm lấy tên tiếng Việt cho loại banner
    const getVietnameseTypeName = (type) => {
        switch (type) {
            case 'slider': return 'Slider';
            case 'left': return 'Bên trái';
            case 'right': return 'Bên phải';
            default: return 'Banner';
        }
    };

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Title
                    title={current?.id ? "Cập nhật banner" : `Thêm banner ${getVietnameseTypeName(selectedType)}`}
                    description={
                        current?.id ? "Chỉnh sửa thông tin banner" : "Thêm banner mới"
                    }
                />
            </div>
            <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-9/12 relative dark:bg-gray-700 dark:text-gray-200">
                <div className="p-6 flex-grow scrollbar-hide w-full max-h-full">
                    <BannerForm
                        register={register}
                        errors={errors}
                        banner={current}
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        isActive={isActive}
                        setIsActive={setIsActive}
                        isSubmitting={isSubmitting}
                        onSubmit={onSubmit}
                        handleSubmit={handleSubmit}
                        selectedType={selectedType}
                        imageError={imageError}
                        setImageError={setImageError}
                        setSelectedFile={setSelectedFile}
                    />
                </div>
            </Scrollbars>
        </>
    );
};

export default BannerDrawer; 