import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import CouponServices from "@/services/CouponServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useCouponSubmit = (id) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate } = useContext(SidebarContext);
  const [discountType, setDiscountType] = useState(true); // true = PERCENT, false = FIXED
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const couponData = {
        code: data.code,
        description: data.description,
        discountType: discountType ? "PERCENT" : "FIXED",
        discountValue: parseFloat(data.discountValue),
        startDate: data.startDate,
        endDate: data.endDate,
        usageLimit: parseInt(data.usageLimit),
        minOrderValue: parseFloat(data.minOrderValue),
        maxDiscountAmount: parseFloat(data.maxDiscountAmount)
      };

      if (id) {
        const res = await CouponServices.updateCoupon(id, couponData);
        setIsUpdate(true);
        setIsSubmitting(false);
        notifySuccess(res.message || "Cập nhật mã giảm giá thành công");
        closeDrawer();
      } else {
        const res = await CouponServices.addCoupon(couponData);
        setIsUpdate(true);
        setIsSubmitting(false);
        notifySuccess(res.message || "Tạo mã giảm giá mới thành công");
        closeDrawer();
      }
    } catch (err) {
      if (err?.response?.data?.message === "Mã giảm giá này đã tồn tại") {
        notifyError("Mã giảm giá này đã tồn tại");
      } else {
        notifyError(err?.response?.data?.message || err?.message || "Đã xảy ra lỗi");
      }
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setValue("code", "");
      setValue("description", "");
      setValue("startDate", "");
      setValue("endDate", "");
      setValue("discountValue", "");
      setValue("minOrderValue", "");
      setValue("usageLimit", "");
      setValue("maxDiscountAmount", "");
      clearErrors();
      setDiscountType(true);
      return;
    }

    if (id) {
      (async () => {
        try {
          const res = await CouponServices.getCouponById(id);
          if (res && res.data) {
            const coupon = res.data;
            setValue("code", coupon.code);
            setValue("description", coupon.description);
            setValue("startDate", dayjs(coupon.startDate).format("YYYY-MM-DDTHH:mm"));
            setValue("endDate", dayjs(coupon.endDate).format("YYYY-MM-DDTHH:mm"));
            setValue("discountValue", coupon.discountValue);
            setValue("minOrderValue", coupon.minOrderValue);
            setValue("usageLimit", coupon.usageLimit);
            setValue("maxDiscountAmount", coupon.maxDiscountAmount);
            setDiscountType(coupon.discountType === "PERCENT");
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message || "Không thể tải dữ liệu");
        }
      })();
    }
  }, [id, setValue, isDrawerOpen, clearErrors]);

  // Form field registration with validation rules
  const registerField = {
    code: register("code", {
      required: "Mã giảm giá là bắt buộc",
      minLength: {
        value: 3,
        message: "Mã giảm giá phải có ít nhất 3 ký tự"
      },
      maxLength: {
        value: 20,
        message: "Mã giảm giá không được quá 20 ký tự"
      },
      pattern: {
        value: /^[A-Z0-9_-]+$/,
        message: "Mã giảm giá chỉ được chứa chữ in hoa, số, dấu gạch ngang và gạch dưới"
      }
    }),
    description: register("description", {
      required: "Mô tả mã giảm giá là bắt buộc",
      maxLength: {
        value: 100,
        message: "Mô tả không được quá 100 ký tự"
      }
    }),
    startDate: register("startDate", {
      required: "Ngày bắt đầu là bắt buộc"
    }),
    endDate: register("endDate", {
      required: "Ngày kết thúc là bắt buộc",
      validate: value => {
        if (value && document.querySelector('input[name="startDate"]').value) {
          return new Date(value) > new Date(document.querySelector('input[name="startDate"]').value) ||
            "Ngày kết thúc phải sau ngày bắt đầu";
        }
        return true;
      }
    }),
    discountValue: register("discountValue", {
      required: "Giá trị giảm giá là bắt buộc",
      min: {
        value: 1,
        message: "Giá trị giảm giá phải lớn hơn 0"
      },
      max: {
        value: discountType ? 100 : 1000000,
        message: discountType
          ? "Phần trăm giảm giá không được quá 100%"
          : "Giá trị giảm giá không được quá 1,000,000 VND"
      }
    }),
    minOrderValue: register("minOrderValue", {
      required: "Giá trị đơn hàng tối thiểu là bắt buộc",
      min: {
        value: 0,
        message: "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0"
      }
    }),
    usageLimit: register("usageLimit", {
      required: "Giới hạn sử dụng là bắt buộc",
      min: {
        value: 1,
        message: "Giới hạn sử dụng phải lớn hơn 0"
      }
    }),
    maxDiscountAmount: register("maxDiscountAmount", {
      required: "Giá trị giảm tối đa là bắt buộc",
      min: {
        value: 0,
        message: "Giá trị giảm tối đa phải lớn hơn hoặc bằng 0"
      }
    })
  };

  return {
    register: registerField,
    handleSubmit,
    onSubmit,
    errors,
    discountType,
    setDiscountType,
    isSubmitting
  };
};

export default useCouponSubmit;
