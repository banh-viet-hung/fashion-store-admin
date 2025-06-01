import { TableBody, TableCell, TableRow, Badge, Avatar } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import React from "react";
import { FiEdit, FiZoomIn, FiShoppingBag, FiInfo } from "react-icons/fi";
import { Link } from "react-router-dom";

// internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Tooltip from "@/components/tooltip/Tooltip";
import CustomerDrawer from "@/components/drawer/CustomerDrawer";
import UserStatusButton from "@/components/table/UserStatusButton";

const CustomerTable = ({ customers }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

  return (
    <>
      <DeleteModal id={serviceId} title={title} />

      <MainDrawer>
        <CustomerDrawer id={serviceId} />
      </MainDrawer>

      <TableBody className="dark:bg-gray-900">
        {customers?.map((user) => (
          <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {/* Họ tên */}
            <TableCell>
              <div className="flex items-center">
                <Avatar
                  className="hidden mr-3 md:block bg-gray-50 p-1 border border-gray-200 dark:border-gray-700"
                  src={user.avatar || "https://via.placeholder.com/40x40"}
                  alt={user.fullName}
                />
                <div>
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.fullName}</h2>
                </div>
              </div>
            </TableCell>

            {/* Email */}
            <TableCell>
              <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
            </TableCell>

            {/* SĐT */}
            <TableCell>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.phoneNumber || "Chưa cập nhật"}
              </span>
            </TableCell>

            {/* Trạng thái */}
            <TableCell className="text-center">
              <div className="flex items-center justify-center">
                <Badge
                  type={user.active ? "success" : "danger"}
                  className="px-3 py-1 text-xs font-medium w-20"
                >
                  {user.active ? 'Hoạt động' : 'Bị khóa'}
                </Badge>

                {!user.active && (
                  <div className="relative inline-block ml-2 group">
                    <FiInfo className="h-4 w-4 text-amber-500 cursor-help" />
                    <div className="absolute z-10 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 w-64 text-xs text-left bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lý do khóa tài khoản:</p>
                      <p className="text-gray-600 dark:text-gray-400">{user.lockReason || "Không có lý do được cung cấp"}</p>
                      <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 rotate-45 -bottom-1.5 left-1/2 transform -translate-x-1/2 border-b border-r border-gray-200 dark:border-gray-700"></div>
                    </div>
                  </div>
                )}
              </div>
            </TableCell>

            {/* Hành động */}
            <TableCell>
              <div className="flex justify-end items-center space-x-1">
                <div className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  <Link to={`/customer-order/${user.id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiShoppingBag}
                      title={t("Xem đơn hàng")}
                      bgColor="#34D399"
                    />
                  </Link>
                </div>

                <UserStatusButton email={user.email} isActive={user.active} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default CustomerTable;
