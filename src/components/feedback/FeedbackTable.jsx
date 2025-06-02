import { TableBody, TableCell, TableRow, Badge, Avatar } from "@windmill/react-ui";
import React, { useContext } from "react";
import { FiStar, FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";

// internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Tooltip from "@/components/tooltip/Tooltip";
import { SidebarContext } from "@/context/SidebarContext";

const FeedbackTable = ({ feedback }) => {
    const { title, serviceId, handleModalOpen } = useToggleDrawer();

    // Format date to Vietnamese format
    const formatVietnameseDate = (dateString) => {
        if (!dateString) return '';
        const date = dayjs(dateString);
        return date.format('DD/MM/YYYY HH:mm');
    };

    // Render star rating
    const renderStarRating = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
            );
        }
        return <div className="flex items-center">{stars}</div>;
    };

    return (
        <>
            <DeleteModal id={serviceId} title={title} />

            <MainDrawer>
                {/* FeedbackDrawer component would go here if needed */}
            </MainDrawer>

            <TableBody className="dark:bg-gray-900">
                {feedback?.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        {/* Thông tin sản phẩm và User */}
                        <TableCell>
                            <div className="flex items-center">
                                <Avatar
                                    className="hidden mr-3 md:block bg-gray-50 p-1 border border-gray-200 dark:border-gray-700"
                                    src={item.productImage || "https://via.placeholder.com/40x40"}
                                    alt={item.productName}
                                />
                                <div>
                                    <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.productName}</h2>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                                        <span className="mr-2">{item.color}</span>
                                        {item.size && (
                                            <>
                                                <span className="mx-1">|</span>
                                                <span>{item.size}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TableCell>

                        {/* User */}
                        <TableCell>
                            <div className="flex items-center">
                                <Avatar
                                    className="hidden mr-3 md:block bg-gray-50 p-1 border border-gray-200 dark:border-gray-700"
                                    src={item.userAvatar || "https://via.placeholder.com/40x40"}
                                    alt={item.userName}
                                />
                                <div>
                                    <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.userName}</h2>
                                    <p className="text-xs text-gray-500">{item.userEmail}</p>
                                </div>
                            </div>
                        </TableCell>

                        {/* Đánh giá */}
                        <TableCell>
                            <div className="space-y-2">
                                {renderStarRating(item.rating)}
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.comment}</p>
                            </div>
                        </TableCell>

                        {/* Thời gian */}
                        <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatVietnameseDate(item.createdAt)}
                            </span>
                            {item.edited && (
                                <span className="text-xs text-gray-500 block">(Đã chỉnh sửa)</span>
                            )}
                        </TableCell>

                        {/* Hành động */}
                        <TableCell>
                            <div className="flex justify-end items-center">
                                <div
                                    className="p-2 cursor-pointer text-gray-400 hover:text-red-600"
                                    onClick={() => handleModalOpen(item.id, item.comment)}
                                >
                                    <Tooltip
                                        id="delete"
                                        Icon={FiTrash2}
                                        title="Xóa đánh giá"
                                        bgColor="#F87171"
                                    />
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </>
    );
};

export default FeedbackTable; 