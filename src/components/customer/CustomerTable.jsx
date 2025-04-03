import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import React from "react";
import { FiEdit, FiZoomIn } from "react-icons/fi";
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

      <TableBody>
        {customers?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <span
                className={`px-2 py-1 rounded text-xs ${user.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
              >
                {user.active ? 'Active' : 'Blocked'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {user.dateOfBirth
                  ? dayjs(user.dateOfBirth).format("MMM D, YYYY")
                  : "Chưa cập nhật"}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{user.fullName}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{user.email}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-medium">
                {user.phoneNumber || "Chưa cập nhật"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end text-right">
                <div className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  <Link to={`/customer-order/${user.id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiZoomIn}
                      title={t("ViewOrder")}
                      bgColor="#34D399"
                    />
                  </Link>
                </div>
                {/* <button
                  onClick={() => handleUpdate(user.id)}
                  className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600 focus:outline-none"
                >
                  <Tooltip id="edit" Icon={FiEdit} title={t("Edit")} bgColor="#10B981" />
                </button> */}
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
