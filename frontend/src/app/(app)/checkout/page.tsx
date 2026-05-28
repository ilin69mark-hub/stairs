"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cart";
import { createOrder } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const checkoutSchema = z.object({
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  phone: z.string().regex(/^\+?\d[\d\s\-()]{7,20}$/, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
  address: z.string().optional(),
  comment: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { currentConfig, calculatedResult, clearCart } = useCartStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    if (!currentConfig) {
      router.push("/configurator");
    }
  }, [currentConfig, router]);

  if (!currentConfig) {
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitError(null);
    try {
      const digits = data.phone.replace(/\D/g, "");
      const phoneWithPrefix = data.phone.startsWith("+7")
        ? data.phone
        : `+7${digits.replace(/^8?/, "").slice(-10)}`;

      const result = await createOrder({
        customerName: data.name,
        customerPhone: phoneWithPrefix,
        customerEmail: data.email || undefined,
        customerAddress: data.address || undefined,
        comment: data.comment || undefined,
        stairConfig: currentConfig as unknown as Record<string, unknown>,
      });

      clearCart();
      router.push(`/checkout/success?orderNumber=${result.orderNumber}`);
    } catch {
      setSubmitError("Не удалось оформить заказ. Попробуйте позже.");
    }
  };

  const materialNames: Record<string, string> = {
    oak: "Дуб",
    beech: "Бук",
    ash: "Ясень",
    pine: "Сосна",
    metal: "Металл",
    glass: "Стекло",
  };

  const typeNames: Record<string, string> = {
    straight: "Прямая",
    "l-shaped": "Г-образная",
    "u-shaped": "П-образная",
    spiral: "Винтовая",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-10"
        >
          Оформление заказа
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Контактные данные</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label className="mb-2 block">Имя *</Label>
                  <Input
                    {...register("name")}
                    placeholder="Ваше имя"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Телефон *</Label>
                  <Input
                    {...register("phone")}
                    placeholder="+7 (999) 123-45-67"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="example@mail.ru"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Адрес</Label>
                  <Input
                    {...register("address")}
                    placeholder="Адрес доставки"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Комментарий</Label>
                  <textarea
                    {...register("comment")}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    placeholder="Дополнительные пожелания..."
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {submitError}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Отправка..." : "Подтвердить заказ"}
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Сводка заказа</h2>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Тип лестницы</span>
                  <span className="font-medium">{typeNames[currentConfig.type] || currentConfig.type}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Высота этажа</span>
                  <span className="font-medium">{currentConfig.floorHeight} мм</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Ширина проёма</span>
                  <span className="font-medium">{currentConfig.openingWidth} мм</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Ширина ступени</span>
                  <span className="font-medium">{currentConfig.stepWidth} мм</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Материал</span>
                  <span className="font-medium">{materialNames[currentConfig.material] || currentConfig.material}</span>
                </div>

                {calculatedResult && (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Материал</span>
                      <span>{calculatedResult.materialCost.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Работа</span>
                      <span>{calculatedResult.workCost.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Ограждение</span>
                      <span>{calculatedResult.railingCost.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Покрытие</span>
                      <span>{calculatedResult.coatingCost.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between py-4 text-xl font-bold">
                  <span>Итого:</span>
                  <span className="text-blue-600">
                    {calculatedResult?.totalPrice?.toLocaleString("ru-RU") || "—"} ₽
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/configurator")}
              >
                Вернуться к конфигуратору
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}