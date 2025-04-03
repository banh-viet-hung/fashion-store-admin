import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// internal import
import { SidebarContext } from "@/context/SidebarContext";
import AdminServices from "@/services/AdminServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useAddStaffSubmit = () => {
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

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const userData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role
      };

      const response = await AdminServices.createUser(userData);
      notifySuccess(response.message || "Tạo người dùng thành công");
      setIsUpdate(true);
      closeDrawer();
      setIsSubmitting(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Lỗi khi tạo người dùng");
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

export default useAddStaffSubmit; 