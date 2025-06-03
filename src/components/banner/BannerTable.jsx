import React, { useContext } from 'react';
import { TableCell, TableBody, TableRow, Badge, Avatar } from '@windmill/react-ui';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { SidebarContext } from '@/context/SidebarContext';
import SimpleBannerDeleteModal from '@/components/modal/SimpleBannerDeleteModal';

const BannerTable = ({
    banners,
    deleteModalOpen,
    setDeleteModalOpen,
    isCheck,
    setIsCheck,
    isLoading,
    setIsLoading,
    handleUpdate,
    handleToggleActive,
    handleDelete,
}) => {
    const { t } = useTranslation();
    const { isDrawerOpen, setIsDrawerOpen } = useContext(SidebarContext);

    const handleEditBanner = (banner) => {
        setIsCheck(banner);
        setIsDrawerOpen(true);
    };

    console.log('Banners in BannerTable:', banners); // Debug log

    return (
        <>
            <SimpleBannerDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => handleDelete(isCheck.id)}
                isLoading={isLoading}
            />

            <TableBody>
                {Array.isArray(banners) && banners.map((banner, index) => (
                    <TableRow key={banner.id}>
                        <TableCell>
                            <span className="text-sm">{index + 1}</span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center">
                                <Avatar
                                    className="hidden mr-3 md:block bg-gray-50 p-1"
                                    src={banner?.img}
                                    alt={banner?.name}
                                />
                                <div>
                                    <h2 className="text-sm font-medium">{banner?.name}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {banner?.subtitle}
                                    </p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm">{banner?.type}</span>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm">{banner?.displayOrder}</span>
                        </TableCell>
                        <TableCell>
                            <div onClick={() => handleToggleActive(banner.id)}>
                                {banner?.active ? (
                                    <Badge type="success">{t("Active")}</Badge>
                                ) : (
                                    <Badge type="danger">{t("Inactive")}</Badge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center space-x-4">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => handleEditBanner(banner)}
                                >
                                    <FiEdit className="text-green-500 hover:text-green-600" />
                                </div>
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setIsCheck(banner);
                                        setDeleteModalOpen(true);
                                    }}
                                >
                                    <FiTrash2 className="text-red-500 hover:text-red-600" />
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </>
    );
};

export default BannerTable; 