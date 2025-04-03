import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// internal import
import { SidebarContext } from "@/context/SidebarContext";
import AdminServices from "@/services/AdminServices";
import UserRoleServices from "@/services/UserRoleServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useRoleChangeSubmit = (email, currentRole) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeDrawer, setIsUpdate } = useContext(SidebarContext);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Lấy danh sách các quyền
  useEffect(() => {
    setLoading(true);
    AdminServices.getAllRoles()
      .then((data) => {
        if (data._embedded && data._embedded.role) {
          setRoles(data._embedded.role);
        }
        setLoading(false);
      })
      .catch((err) => {
        notifyError(err?.response?.data?.message || "Lỗi khi lấy danh sách quyền");
        setLoading(false);
      });
  }, []);

  // Đặt giá trị mặc định cho select role là quyền hiện tại
  useEffect(() => {
    if (currentRole) {
      setValue("role", currentRole);
    }
  }, [currentRole, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await UserRoleServices.updateUserRole(email, data.role);
      notifySuccess(response.message || "Cập nhật quyền cho người dùng thành công");
      setIsUpdate(true);
      closeDrawer();
      setIsSubmitting(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Lỗi khi cập nhật quyền");
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    roles,
    loading,
    isSubmitting,
  };
};

export default useRoleChangeSubmit; 