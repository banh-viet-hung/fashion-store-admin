import React from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Card, CardBody, Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// internal import
import Title from "@/components/form/others/Title";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";
import useRoleChangeSubmit from "@/hooks/useRoleChangeSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";

const RoleChangeDrawer = ({ staff }) => {
  const { t } = useTranslation();
  const { email, roleName } = staff || {};
  
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    roles,
    loading,
    isSubmitting
  } = useRoleChangeSubmit(email, roleName);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Title
          title={t("Thay đổi quyền")}
          description={t("Cập nhật quyền cho tài khoản staff")}
        />
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <Card className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-full">
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                  <LabelArea label={t("Email")} />
                  <div className="col-span-8 sm:col-span-4">
                    <p className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                  <LabelArea label={t("Quyền hiện tại")} />
                  <div className="col-span-8 sm:col-span-4">
                    <p className="block w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md">
                      {roleName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                  <LabelArea label={t("Quyền mới")} />
                  <div className="col-span-8 sm:col-span-4">
                    {loading ? (
                      <Select disabled>
                        <option>{t("Đang tải...")}</option>
                      </Select>
                    ) : (
                      <Select 
                        className="border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-white border-transparent focus:bg-white"
                        name="role"
                        {...register("role", {
                          required: "Quyền không được để trống",
                        })}
                      >
                        {roles
                          .filter(role => role.name !== "USER") // Loại bỏ quyền USER nếu cần
                          .map((role) => (
                            <option key={role.name} value={role.name}>
                              {role.name}
                            </option>
                          ))}
                      </Select>
                    )}
                    <Error errorName={errors.role} />
                  </div>
                </div>
              </div>

              <DrawerButton
                id={true}
                title="Role"
                isSubmitting={isSubmitting}
              />
            </form>
          </CardBody>
        </Card>
      </Scrollbars>
    </>
  );
};

export default RoleChangeDrawer; 