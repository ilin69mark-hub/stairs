"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("orderNumber");
  
  const [minutesLeft, setMinutesLeft] = useState(15);

  useEffect(() => {
    if (minutesLeft <= 0) return;
    const timer = setTimeout(() => {
      setMinutesLeft((prev) => prev - 1);
    }, 60000);
    return () => clearTimeout(timer);
  }, [minutesLeft]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container max-w-lg mx-auto px-4"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-4"
        >
          Заказ оформлен!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-2"
        >
          Номер заказа:
        </motion.p>
        {orderNumber && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-blue-600 mb-6"
          >
            {orderNumber}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 rounded-lg p-4 mb-6"
        >
          <p className="text-blue-800">
            Менеджер свяжется с вами в течение{" "}
            <span className="font-bold text-xl">{minutesLeft}</span>{" "}
            {minutesLeft === 1 ? "минуту" : minutesLeft >= 2 && minutesLeft <= 4 ? "минуты" : "минут"}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-gray-600 mb-8"
        >
          Спасибо за заказ! Мы свяжемся с вами для уточнения деталей и
          подтверждения.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            size="lg"
          >
            Вернуться на главную
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Suspense fallback={<div className="text-center">Загрузка...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}