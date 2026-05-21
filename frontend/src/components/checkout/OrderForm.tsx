"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createOrder } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/cart";
import { useRouter } from "next/navigation";

const orderSchema = z.object({
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, "Формат: +7XXXXXXXXXX")
    .or(z.string().min(11, "Введите 11 цифр номера")),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
  address: z.string().optional(),
  comment: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export function OrderForm() {
  const router = useRouter();
  const { currentConfig, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const onSubmit = async (data: OrderFormData) => {
    if (!currentConfig) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedPhone = data.phone.replace(/\D/g, "");
      const phoneWithPrefix = formattedPhone.startsWith("7") 
        ? `+7${formattedPhone}` 
        : `+7${formattedPhone.slice(-10)}`;

      const response = await createOrder({
        customerName: data.name,
        customerPhone: phoneWithPrefix,
        customerEmail: data.email || undefined,
        customerAddress: data.address || undefined,
        comment: data.comment || undefined,
        stairConfig: currentConfig as unknown as Record<string, unknown>,
      });

      clearCart();
      router.push(`/checkout/success?orderNumber=${response.orderNumber}`);
    } catch (err) {
      setError("Не удалось оформить заказ. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="name" className="mb-2 block">
          Имя *
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Ваше имя"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="mb-2 block">
          Телефон *
        </Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="+7XXXXXXXXXX"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          {...register("email")}
          type="email"
          placeholder="example@mail.ru"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address" className="mb-2 block">
          Адрес
        </Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Адрес доставки"
        />
      </div>

      <div>
        <Label htmlFor="comment" className="mb-2 block">
          Комментарий
        </Label>
        <textarea
          id="comment"
          {...register("comment")}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg resize-none"
          placeholder="Дополнительные пожелания..."
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Отправка..." : "Подтвердить заказ"}
      </Button>
    </form>
  );
}