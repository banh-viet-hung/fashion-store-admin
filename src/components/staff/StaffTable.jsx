import { Avatar, TableBody, TableCell, TableRow, Badge } from "@windmill/react-ui";
import React, { useState, useContext, useEffect } from "react";
import { FiZoomIn, FiUser, FiEdit, FiInfo } from "react-icons/fi";
import dayjs from "dayjs";

// internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import MainDrawer from "@/components/drawer/MainDrawer";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Tooltip from "@/components/tooltip/Tooltip";
import DeleteModal from "@/components/modal/DeleteModal";
import StaffStatusButton from "@/components/table/StaffStatusButton";
import AccessListModal from "@/components/modal/AccessListModal";
import RoleChangeDrawer from "@/components/drawer/RoleChangeDrawer";
import { SidebarContext } from "@/context/SidebarContext";

const StaffTable = ({ staffs, lang }) => {
  const {
    title,
    serviceId,
    handleModalOpen,
    handleUpdate,
    isSubmitting,
    handleResetPassword,
  } = useToggleDrawer();

  const { showingTranslateValue } = useUtilsFunction();
  const { toggleDrawer, isDrawerOpen } = useContext(SidebarContext);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [showRoleChangeDrawer, setShowRoleChangeDrawer] = useState(false);

  // Reset state khi drawer đóng
  useEffect(() => {
    if (!isDrawerOpen) {
      setShowRoleChangeDrawer(false);
    }
  }, [isDrawerOpen]);

  const handleAccessModalOpen = (staff) => {
    setSelectedStaff(staff);
    setIsAccessModalOpen(true);
  };

  const handleAccessModalClose = () => {
    setSelectedStaff(null);
    setIsAccessModalOpen(false);
  };

  const handleEditClick = (staff) => {
    setSelectedStaff(staff);
    setShowRoleChangeDrawer(true);
    toggleDrawer();
  };

  // Lấy badge type dựa trên role
  const getRoleBadgeType = (roleName) => {
    switch (roleName) {
      case "ADMIN":
        return "primary";
      case "MANAGER":
        return "success";
      case "STAFF":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <>
      <DeleteModal id={serviceId} title={title} />
      {isAccessModalOpen && (
        <AccessListModal
          staff={selectedStaff}
          isOpen={isAccessModalOpen}
          onClose={handleAccessModalClose}
          showingTranslateValue={showingTranslateValue}
        />
      )}

      {showRoleChangeDrawer && (
        <MainDrawer>
          <RoleChangeDrawer staff={selectedStaff} />
        </MainDrawer>
      )}

      <TableBody className="dark:bg-gray-900">
        {staffs?.map((staff) => (
          <TableRow key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <TableCell>
              <div className="flex items-center">
                <Avatar
                  className="hidden mr-3 md:block bg-gray-50 p-1 border border-gray-200 dark:border-gray-700"
                  src={staff.avatar || "https://via.placeholder.com/40x40"}
                  alt={staff.fullName}
                />
                <div>
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">{staff.fullName}</h2>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm text-gray-600 dark:text-gray-400">{staff.email}</span>
            </TableCell>

            <TableCell>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {staff.phoneNumber || "Chưa cập nhật"}
              </span>
            </TableCell>

            <TableCell>
              <Badge
                type={getRoleBadgeType(staff.roleName)}
                className="px-3 py-1 text-xs font-medium"
              >
                {staff.roleName}
              </Badge>
            </TableCell>

            <TableCell className="text-center">
              <div className="flex items-center justify-center">
                <Badge
                  type={staff.active ? "success" : "danger"}
                  className="px-3 py-1 text-xs justify-center w-20"
                >
                  {staff.active ? 'Hoạt động' : 'Bị khóa'}
                </Badge>

                {!staff.active && (
                  <div className="relative inline-block ml-2 group">
                    <FiInfo className="h-4 w-4 text-amber-500 cursor-help" />
                    <div className="absolute z-10 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 w-64 text-xs text-left bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lý do khóa tài khoản:</p>
                      <p className="text-gray-600 dark:text-gray-400">{staff.lockReason || "Không có lý do được cung cấp"}</p>
                      <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 rotate-45 -bottom-1.5 left-1/2 transform -translate-x-1/2 border-b border-r border-gray-200 dark:border-gray-700"></div>
                    </div>
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="flex justify-end items-center space-x-1">
                <StaffStatusButton
                  id={staff.id}
                  email={staff.email}
                  isActive={staff.active}
                  handleUpdate={() => handleEditClick(staff)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default StaffTable;