import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useState, useContext, useEffect } from "react";
import { FiZoomIn } from "react-icons/fi";
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

      <TableBody>
        {staffs?.map((staff) => (
          <TableRow key={staff.id}>
            <TableCell>
              <div className="flex items-center">
                <Avatar
                  className="hidden mr-3 md:block bg-gray-50"
                  src={staff.avatar}
                  alt="staff"
                />
                <div>
                  <h2 className="text-sm font-medium">{staff.fullName}</h2>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm">{staff.email}</span>
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {staff.phoneNumber || "Chưa cập nhật"}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {staff.dateOfBirth
                  ? dayjs(staff.dateOfBirth).format("DD/MM/YYYY")
                  : "Chưa cập nhật"}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">{staff.roleName}</span>
            </TableCell>

            <TableCell className="text-center text-xs">
              <span
                className={`px-2 py-1 rounded ${staff.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
              >
                {staff.active ? 'Active' : 'Blocked'}
              </span>
            </TableCell>

            <TableCell>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleAccessModalOpen(staff)}
                  className="text-gray-400"
                >
                  <Tooltip
                    id="view"
                    Icon={FiZoomIn}
                    title="View Access Route"
                    bgColor="#059669"
                  />
                </button>
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