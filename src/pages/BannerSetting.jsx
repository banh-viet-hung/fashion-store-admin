import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarContext } from '@/context/SidebarContext';

//internal import
import Loading from '@/components/preloader/Loading';
import PageTitle from '@/components/Typography/PageTitle';
import AnimatedContent from '@/components/common/AnimatedContent';
import useBannerSubmit from '@/hooks/useBannerSubmit';
import MainDrawer from '@/components/drawer/MainDrawer';
import BannerDrawer from '@/components/banner/BannerDrawer';
import SimpleBannerDeleteModal from '@/components/modal/SimpleBannerDeleteModal';
import BannerSection from '@/components/banner/BannerSection';

const BannerSetting = () => {
    const { t } = useTranslation();
    const { isDrawerOpen, setIsDrawerOpen } = useContext(SidebarContext);

    const {
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
        handleToggleActive,
        handleDelete,
        handleUpdate,
        handleAddBanner,
    } = useBannerSubmit();

    const handleEditBanner = (banner) => {
        setIsCheck(banner);
        setSelectedType(banner.type);
        setIsDrawerOpen(true);
    };

    const handleDeleteBanner = (banner) => {
        setIsCheck(banner);
        setDeleteModalOpen(true);
    };

    const handleAddClick = (type) => {
        const result = handleAddBanner(type);

        if (result !== null) {
            setIsDrawerOpen(true);
        }
    };

    return (
        <>
            <PageTitle>Quản lý Banner</PageTitle>
            <AnimatedContent>
                <MainDrawer>
                    <BannerDrawer
                        current={isCheck}
                        handleUpdate={handleUpdate}
                        selectedType={selectedType}
                    />
                </MainDrawer>

                <SimpleBannerDeleteModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={() => handleDelete(isCheck.id)}
                    isLoading={isSubmitting}
                />

                {loading ? (
                    <Loading />
                ) : (
                    <div className="space-y-6">
                        <div className="w-full">
                            <BannerSection
                                title="Banner Slider"
                                description="Các banner hiển thị dạng slider ở trên cùng của trang"
                                banners={sliderBanners}
                                type="slider"
                                handleAddBanner={() => handleAddClick('slider')}
                                handleEditBanner={handleEditBanner}
                                handleDeleteBanner={handleDeleteBanner}
                                handleToggleActive={handleToggleActive}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <BannerSection
                                    title="Banner Bên Trái"
                                    description="Các banner hiển thị ở khu vực bên trái"
                                    banners={leftBanners}
                                    type="left"
                                    handleAddBanner={() => handleAddClick('left')}
                                    handleEditBanner={handleEditBanner}
                                    handleDeleteBanner={handleDeleteBanner}
                                    handleToggleActive={handleToggleActive}
                                />
                            </div>
                            <div>
                                <BannerSection
                                    title="Banner Bên Phải"
                                    description="Các banner hiển thị ở khu vực bên phải"
                                    banners={rightBanners}
                                    type="right"
                                    handleAddBanner={() => handleAddClick('right')}
                                    handleEditBanner={handleEditBanner}
                                    handleDeleteBanner={handleDeleteBanner}
                                    handleToggleActive={handleToggleActive}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </AnimatedContent>
        </>
    );
};

export default BannerSetting; 