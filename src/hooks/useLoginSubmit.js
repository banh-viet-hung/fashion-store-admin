import Cookies from "js-cookie";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useLocation } from "react-router-dom";

//internal import
import { AdminContext } from "@/context/AdminContext";
import AdminServices from "@/services/AdminServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useLoginSubmit = () => {
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AdminContext);
  const history = useHistory();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ name, email, verifyEmail, password, role }) => {
    setLoading(true);
    const cookieTimeOut = 1 / 24; // 1 hour

    try {
      if (location.pathname === "/login") {
        // const res = await AdminServices.loginAdmin({ email, password });
        // console.log("Phản hồi sau khi login", res);

        // if (res) {
        //   notifySuccess("Đăng nhập thành công!");
        //   dispatch({ type: "USER_LOGIN", payload: res });
        //   Cookies.set("adminInfo", JSON.stringify(res), {
        //     expires: cookieTimeOut,
        //     sameSite: "None",
        //     secure: true,
        //   });
        //   history.replace("/dashboard");
        // }

        const res = await AdminServices.loginAdmin({
          email,
          password,
          rememberMe: false,
        });
        console.log("Phản hồi sau khi login", res);
        if (res && res.success) {
          if (res.data.role === "USER") {
            notifyError("Bạn không có quyền truy cập trang này!");
            return;
          }

          dispatch({ type: "USER_LOGIN", payload: res.data });
          Cookies.set("adminInfo", JSON.stringify(res.data), {
            expires: cookieTimeOut,
            sameSite: "None",
            secure: true,
          });
          history.replace("/dashboard");
        } else {
          notifyError(res.message || "Lỗi không xác định!");
        }
      }

      if (location.pathname === "/signup") {
        const res = await AdminServices.registerAdmin({
          name,
          email,
          password,
          role,
        });

        if (res) {
          notifySuccess("Register Success!");
          dispatch({ type: "USER_LOGIN", payload: res });
          Cookies.set("adminInfo", JSON.stringify(res), {
            expires: cookieTimeOut,
            sameSite: "None",
            secure: true,
          });
          history.replace("/");
        }
      }

      if (location.pathname === "/forgot-password") {
        const res = await AdminServices.forgetPassword({ verifyEmail });

        notifySuccess(res.message);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    onSubmit,
    register,
    handleSubmit,
    errors,
    loading,
  };
};

export default useLoginSubmit;
