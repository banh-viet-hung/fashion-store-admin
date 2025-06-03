import React from 'react';
import { Button, Badge, Avatar } from '@windmill/react-ui';
import { FiEdit, FiTrash2, FiPlus, FiLink } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const BannerSection = ({
    title,
    description,
    banners,
    type,
    handleAddBanner,
    handleEditBanner,
    handleDeleteBanner,
    handleToggleActive
}) => {
    const { t } = useTranslation();

    // Kiểm tra xem nếu là banner trái hoặc phải và đã có 1 banner thì không hiển thị nút thêm
    const showAddButton = type === 'slider' || (banners && banners.length === 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                        {(type === 'left' || type === 'right') && (
                            <span className="ml-1 text-red-500 font-medium">(Tối đa 1 banner)</span>
                        )}
                    </p>
                </div>
                {showAddButton && (
                    <Button
                        onClick={() => handleAddBanner(type)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600"
                        size="small"
                    >
                        <FiPlus />
                        <span>Thêm banner</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {banners && banners.length > 0 ? (
                    banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-4">
                                <Avatar
                                    src={banner.img}
                                    alt={banner.name}
                                    className="hidden sm:block w-12 h-12"
                                />
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium">{banner.name}</h4>
                                        <Badge type={banner.active ? "success" : "danger"} onClick={() => handleToggleActive(banner.id)}>
                                            {banner.active ? "Kích hoạt" : "Vô hiệu"}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                                        <FiLink className="mr-1" />
                                        <span className="truncate max-w-xs">{banner.link}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    className="p-2 text-green-500 hover:text-green-600 hover:bg-green-100 rounded-full"
                                    onClick={() => handleEditBanner(banner)}
                                    title="Chỉnh sửa"
                                >
                                    <FiEdit />
                                </button>
                                <button
                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-full"
                                    onClick={() => handleDeleteBanner(banner)}
                                    title="Xóa"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy banner nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerSection; 