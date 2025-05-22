import React from "react";
import {
  Avatar,
  Badge,
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import { t } from "i18next";
import { FiZoomIn, FiRotateCcw } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";

import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import RestoreModal from "@/components/modal/RestoreModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import Tooltip from "@/components/tooltip/Tooltip";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import ProductServices from "@/services/ProductServices";
import { notifySuccess, notifyError } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";

const formatVND = (value) => {
  if (value == null) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const ProductTable = ({ products, isCheck, setIsCheck }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { toggleModal, isModalOpen } = useContext(SidebarContext);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreId, setRestoreId] = useState('');
  const [restoreProductName, setRestoreProductName] = useState('');
  const [modalType, setModalType] = useState('delete');

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter((item) => item !== id);
      }
    });
  };

  const handleDeleteModalOpen = (id, title) => {
    setModalType('delete');
    handleModalOpen(id, title);
  };

  const handleRestoreModalOpen = (id, name) => {
    setModalType('restore');
    setRestoreId(id);
    setRestoreProductName(name);
    toggleModal();
  };

  return (
    <>
      {isCheck?.length < 1 && modalType === 'delete' && <DeleteModal id={serviceId} title={title} />}
      {modalType === 'restore' && <RestoreModal id={restoreId} productName={restoreProductName} />}

      {/* {isCheck?.length < 2 && (
        <MainDrawer>
          <ProductDrawer currency={currency} id={serviceId} />
        </MainDrawer>
      )} */}

      <TableBody>
        {products?.map((product, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={product?.name}
                id={String(product.id)}
                handleClick={handleClick}
                isChecked={isCheck?.includes(String(product.id))}
              />
            </TableCell>

            <TableCell>
              <div className="flex items-center">
                {product?.thumbnailUrl ? (
                  <Avatar
                    className="hidden p-1 mr-2 md:block bg-gray-50 shadow-none"
                    src={product?.thumbnailUrl}
                    alt="product"
                  />
                ) : (
                  <Avatar
                    src={`https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png`}
                    alt="product"
                  />
                )}
                <div>
                  <h2 className="text-sm font-medium">{product?.name}</h2>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {formatVND(product?.price)}
              </span>
            </TableCell>

            <TableCell>
              {product.salePrice > 0 ? (
                <span className="text-sm font-semibold">
                  {formatVND(product?.salePrice)}
                </span>
              ) : (
                <span className="text-sm font-semibold">
                  {t("Không khuyến mãi")}
                </span>
              )}
            </TableCell>

            <TableCell>
              <span className="text-sm">{product.quantity}</span>
            </TableCell>

            <TableCell>
              {product.deleted || product.status === "da_xoa" ? (
                <Badge type="neutral">Đã xóa</Badge>
              ) : product.quantity > 0 ? (
                <Badge type="success">{t("Selling")}</Badge>
              ) : (
                <Badge type="danger">{t("SoldOut")}</Badge>
              )}
            </TableCell>
            <TableCell className="text-right pr-4">
              <EditDeleteButton
                id={product.id}
                product={product}
                isCheck={isCheck}
                isDeleted={product.deleted || product.status === "da_xoa"}
                handleUpdate={handleUpdate}
                handleModalOpen={handleDeleteModalOpen}
                handleRestoreModalOpen={handleRestoreModalOpen}
                title={product?.name}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default ProductTable;
