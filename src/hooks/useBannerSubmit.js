import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { notifySuccess, notifyError } from '@/utils/toast';
import BannerServices from '@/services/BannerServices';

const useBannerSubmit = () => {
    const { t } = useTranslation();
    const [banners, setBanners] = useState([]);
    const [sliderBanners, setSliderBanners] = useState([]);
    const [leftBanners, setLeftBanners] = useState([]);
    const [rightBanners, setRightBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // drawer states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // selected banner state
    const [isCheck, setIsCheck] = useState({});
    const [selectedType, setSelectedType] = useState('slider');

    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm();

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await BannerServices.getAllBanners();
            console.log("Banner API response:", response);
            if (response.success || response.status) {
                const allBanners = response.data || [];
                setBanners(allBanners);

                // Phân loại banner theo type
                const sliders = allBanners.filter(banner => banner.type === 'slider');
                const left = allBanners.filter(banner => banner.type === 'left');
                const right = allBanners.filter(banner => banner.type === 'right');

                setSliderBanners(sliders);
                setLeftBanners(left);
                setRightBanners(right);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching banners:", error);
            setLoading(false);
            notifyError("Có lỗi xảy ra khi tải dữ liệu banner");
        }
    };

    const handleUpdate = (updatedBanner) => {
        // If we have an updated banner, update it in the state
        if (updatedBanner) {
            const newBanners = banners.map(banner =>
                banner.id === updatedBanner.id ? updatedBanner : banner
            );

            setBanners(newBanners);

            // Cập nhật các danh sách phân loại
            setSliderBanners(newBanners.filter(banner => banner.type === 'slider'));
            setLeftBanners(newBanners.filter(banner => banner.type === 'left'));
            setRightBanners(newBanners.filter(banner => banner.type === 'right'));
        } else {
            // Otherwise, just refresh the banners
            fetchBanners();
        }
    };

    const handleAddBanner = (type) => {
        // Kiểm tra nếu là banner trái hoặc phải
        if (type === 'left' && leftBanners.length >= 1) {
            notifyError("Chỉ được phép có tối đa 1 banner bên trái");
            return null;
        }

        if (type === 'right' && rightBanners.length >= 1) {
            notifyError("Chỉ được phép có tối đa 1 banner bên phải");
            return null;
        }

        setIsCheck({});
        setSelectedType(type);
        return type;
    };

    const handleToggleActive = async (bannerId) => {
        try {
            setLoading(true);
            const response = await BannerServices.toggleActiveBanner(bannerId);
            if (response.success || response.status) {
                notifySuccess("Thay đổi trạng thái banner thành công");

                // Update the banner in the state
                const updatedBanners = banners.map(banner =>
                    banner.id === bannerId ? { ...banner, active: !banner.active } : banner
                );

                setBanners(updatedBanners);

                // Cập nhật các danh sách phân loại
                setSliderBanners(updatedBanners.filter(banner => banner.type === 'slider'));
                setLeftBanners(updatedBanners.filter(banner => banner.type === 'left'));
                setRightBanners(updatedBanners.filter(banner => banner.type === 'right'));
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            notifyError("Lỗi khi thay đổi trạng thái banner");
        }
    };

    const handleDelete = async (bannerId) => {
        try {
            setIsSubmitting(true);
            const response = await BannerServices.deleteBanner(bannerId);
            if (response.success || response.status) {
                // Remove the deleted banner from the state
                const updatedBanners = banners.filter(banner => banner.id !== bannerId);
                setBanners(updatedBanners);

                // Cập nhật các danh sách phân loại
                setSliderBanners(updatedBanners.filter(banner => banner.type === 'slider'));
                setLeftBanners(updatedBanners.filter(banner => banner.type === 'left'));
                setRightBanners(updatedBanners.filter(banner => banner.type === 'right'));

                notifySuccess("Xóa banner thành công");
                setDeleteModalOpen(false);
            }
            setIsSubmitting(false);
        } catch (error) {
            setIsSubmitting(false);
            notifyError("Lỗi khi xóa banner");
        }
    };

    // Load banners on initial render
    useEffect(() => {
        fetchBanners();
    }, []);

    return {
        banners,
        sliderBanners,
        leftBanners,
        rightBanners,
        loading,
        isCheck,
        setIsCheck,
        deleteModalOpen,
        setDeleteModalOpen,
        isSubmitting,
        setIsSubmitting,
        selectedType,
        setSelectedType,
        register,
        handleSubmit,
        errors,
        setValue,
        clearErrors,
        handleUpdate,
        handleToggleActive,
        handleDelete,
        handleAddBanner,
    };
};

export default useBannerSubmit; 