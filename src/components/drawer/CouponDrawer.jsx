import { Input } from "@windmill/react-ui";
import { Scrollbars } from "react-custom-scrollbars-2";

//internal import
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import InputValue from "@/components/form/input/InputValue";
import LabelArea from "@/components/form/selectOption/LabelArea";
import useCouponSubmit from "@/hooks/useCouponSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import SwitchToggleFour from "@/components/form/switch/SwitchToggleFour";

const CouponDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    discountType,
    setDiscountType,
    isSubmitting,
  } = useCouponSubmit(id);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <div>
            <h2 className="text-xl font-medium">Cập nhật mã giảm giá</h2>
            <p className="text-sm text-gray-500">
              Cập nhật thông tin mã giảm giá hiện có
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-medium">Thêm mã giảm giá mới</h2>
            <p className="text-sm text-gray-500">
              Tạo mã giảm giá mới cho khách hàng
            </p>
          </div>
        )}
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Mô tả mã giảm giá" />
              <div className="col-span-8 sm:col-span-4">
                <Input
                  className="mr-2 h-12 p-2"
                  name="description"
                  type="text"
                  placeholder="Nhập mô tả mã giảm giá"
                  {...register.description}
                />
                <Error errorName={errors.description} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Mã giảm giá" />
              <div className="col-span-8 sm:col-span-4">
                <Input
                  className="mr-2 h-12 p-2"
                  name="code"
                  type="text"
                  placeholder="Nhập mã giảm giá (VD: SUMMER2024)"
                  {...register.code}
                />
                <Error errorName={errors.code} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Ngày bắt đầu" />
              <div className="col-span-8 sm:col-span-4">
                <Input
                  className="mr-2 h-12 p-2"
                  name="startDate"
                  type="datetime-local"
                  placeholder="Ngày bắt đầu"
                  {...register.startDate}
                />
                <Error errorName={errors.startDate} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Ngày kết thúc" />
              <div className="col-span-8 sm:col-span-4">
                <Input
                  className="mr-2 h-12 p-2"
                  name="endDate"
                  type="datetime-local"
                  placeholder="Ngày kết thúc"
                  {...register.endDate}
                />
                <Error errorName={errors.endDate} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Loại giảm giá" />
              <div className="col-span-8 sm:col-span-4">
                <SwitchToggleFour
                  handleProcess={setDiscountType}
                  processOption={discountType}
                  activeText="Phần trăm"
                  inactiveText="Số tiền cố định"
                />
                <small className="block mt-1">
                  {discountType ? "Giảm giá theo %" : "Giảm giá cố định"}
                </small>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Giá trị giảm giá" />
              <div className="col-span-8 sm:col-span-4">
                <div className="flex flex-row">
                  <span className="inline-flex items-center px-3 rounded rounded-r-none border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm focus:border-emerald-300 dark:bg-gray-700 dark:text-gray-300 dark:border dark:border-gray-600">
                    {discountType ? "%" : "VND"}
                  </span>
                  <Input
                    className="mr-2 p-2 rounded-l-none"
                    name="discountValue"
                    type="number"
                    placeholder={discountType ? "Nhập phần trăm (1-100)" : "Nhập số tiền cố định"}
                    {...register.discountValue}
                  />
                </div>
                <Error errorName={errors.discountValue} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Giá trị đơn hàng tối thiểu" />
              <div className="col-span-8 sm:col-span-4">
                <div className="flex flex-row">
                  <span className="inline-flex items-center px-3 rounded rounded-r-none border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm focus:border-emerald-300 dark:bg-gray-700 dark:text-gray-300 dark:border dark:border-gray-600">
                    VND
                  </span>
                  <Input
                    className="mr-2 p-2 rounded-l-none"
                    name="minOrderValue"
                    type="number"
                    placeholder="Nhập giá trị đơn hàng tối thiểu"
                    {...register.minOrderValue}
                  />
                </div>
                <Error errorName={errors.minOrderValue} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Giới hạn sử dụng" />
              <div className="col-span-8 sm:col-span-4">
                <Input
                  className="mr-2 h-12 p-2"
                  name="usageLimit"
                  type="number"
                  placeholder="Nhập số lần sử dụng tối đa"
                  {...register.usageLimit}
                />
                <Error errorName={errors.usageLimit} />
              </div>
            </div>
          </div>

          <DrawerButton id={id} title="Coupon" isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default CouponDrawer;
