import {
  Avatar,
  Badge,
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

//internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CheckBox from "@/components/form/others/CheckBox";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import CouponDrawer from "@/components/drawer/CouponDrawer";
import ShowHideButton from "@/components/table/ShowHideButton";
import EditDeleteButton from "@/components/table/EditDeleteButton";

const CouponTable = ({ isCheck, coupons, setIsCheck }) => {
  const [updatedCoupons, setUpdatedCoupons] = useState([]);

  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

  const { currency, showDateFormat, globalSetting, showingTranslateValue } =
    useUtilsFunction();

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

  useEffect(() => {
    const result = coupons?.map((el) => {
      const startDate = new Date(el?.startDate).toLocaleString("vi-VN", {
        timeZone: globalSetting?.default_time_zone,
      });
      const endDate = new Date(el?.endDate).toLocaleString("vi-VN", {
        timeZone: globalSetting?.default_time_zone,
      });
      const newObj = {
        ...el,
        startTime: el?.startDate,
        endTime: el?.endDate,
        updatedDate: startDate,
      };
      return newObj;
    });
    setUpdatedCoupons(result);
  }, [coupons, globalSetting?.default_time_zone]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <>
      {isCheck.length < 1 && <DeleteModal id={serviceId} title={title} />}

      {isCheck.length < 2 && (
        <MainDrawer>
          <CouponDrawer id={serviceId} />
        </MainDrawer>
      )}

      <TableBody>
        {updatedCoupons?.map((coupon, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={coupon?.description || coupon?.code}
                id={String(coupon.id)}
                handleClick={handleClick}
                isChecked={isCheck?.includes(String(coupon.id))}
              />
            </TableCell>

            <TableCell>
              <div className="flex items-center">
                <div>
                  <span className="text-sm font-medium">
                    {coupon?.description || "N/A"}
                  </span>{" "}
                </div>
              </div>{" "}
            </TableCell>

            <TableCell>
              <span className="text-sm font-medium"> {coupon.code}</span>{" "}
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {coupon?.discountType === "PERCENT"
                  ? `${coupon?.discountValue}%`
                  : formatCurrency(coupon?.discountValue)}
              </span>{" "}
            </TableCell>
            <TableCell>
              <span className="text-sm font-semibold">
                {coupon?.maxDiscountAmount ? formatCurrency(coupon?.maxDiscountAmount) : "Không giới hạn"}
              </span>{" "}
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {dayjs(coupon.startDate).format("DD/MM/YYYY")}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {dayjs(coupon.endDate).format("DD/MM/YYYY")}
              </span>
            </TableCell>

            <TableCell className="text-center">
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {coupon.usedCount}/{coupon.usageLimit}
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </TableCell>

            <TableCell className="text-center">
              {dayjs().isAfter(dayjs(coupon.endDate)) ? (
                <Badge type="danger" className="px-2 py-1 text-xs">Hết hạn</Badge>
              ) : (
                <Badge type="success" className="px-2 py-1 text-xs">Còn hạn</Badge>
              )}
            </TableCell>

            <TableCell className="text-right">
              <EditDeleteButton
                id={coupon?.id}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={coupon?.description || coupon?.code}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default CouponTable;
