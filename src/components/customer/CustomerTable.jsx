import { TableBody, TableCell, TableRow, Badge, Avatar } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import React from "react";
import { FiEdit, FiZoomIn, FiShoppingBag } from "react-icons/fi";
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
            {/* Trạng thái */}
            <TableCell>
              <Badge
                type={user.active ? "success" : "danger"}
                className="px-3 py-1 text-xs font-medium"
              >
                {user.active ? 'Hoạt động' : 'Bị khóa'}
              </Badge>
            </TableCell>

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
