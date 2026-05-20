"use client";

import { useRouter } from "next/navigation";
import { useStairConfigurator } from "@/hooks/useStairConfigurator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { StairType } from "@/stores/configurator";

export function ControlPanel() {
  const router = useRouter();
  const { config, updateConfig, geometry, price, isLoading, calculatedResult } = useStairConfigurator();

  const stairTypes = [
    { id: "straight", name: "Прямая", icon: "↗️" },
    { id: "l-shaped", name: "Г-образная", icon: "📐" },
    { id: "u-shaped", name: "П-образная", icon: "🔄" },
    { id: "spiral", name: "Винтовая", icon: "🌀" },
  ];

  return (
    <div className="w-[400px] flex-shrink-0 bg-white border-r overflow-y-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Конфигуратор лестницы</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Тип лестницы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {stairTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateConfig.setType(type.id as StairType)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config?.type === type.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Размеры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">Высота этажа (мм)</Label>
              <input
                type="number"
                defaultValue={config?.floorHeight || 2800}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val > 0) updateConfig.setFloorHeight(val);
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-lg font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-600 mb-1 block">Ширина проёма (мм)</Label>
              <input
                type="number"
                defaultValue={config?.openingWidth || 900}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val > 0) updateConfig.setOpeningWidth(val);
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-lg font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Материал</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "oak", name: "Дуб", color: "#D2691E" },
                { id: "beech", name: "Бук", color: "#CD853F" },
                { id: "ash", name: "Ясень", color: "#DEB887" },
                { id: "pine", name: "Сосна", color: "#F4A460" },
                { id: "metal", name: "Металл", color: "#708090" },
                { id: "glass", name: "Стекло", color: "#ADD8E6" },
              ].map((material) => (
                <button
                  key={material.id}
                  onClick={() => updateConfig.setMaterial(material.id)}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                    config?.material === material.id
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="h-16 w-full"
                    style={{ backgroundColor: material.color }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                    {material.name}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ограждение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "wood", name: "Деревянные", icon: "🪵" },
                { id: "metal", name: "Металлические", icon: "⚙️" },
                { id: "glass", name: "Стеклянные", icon: "🫧" },
              ].map((railing) => (
                <button
                  key={railing.id}
                  onClick={() => updateConfig.setRailing(railing.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config?.railing === railing.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{railing.icon}</div>
                  <div className="text-sm font-medium">{railing.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Покрытие</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "varnish-matte", name: "Лак матовый", color: "#A0522D" },
                { id: "varnish-glossy", name: "Лак глянцевый", color: "#8B4513" },
                { id: "oil", name: "Масло", color: "#DAA520" },
                { id: "paint", name: "Краска", color: "#F5F5DC" },
              ].map((coating) => (
                <button
                  key={coating.id}
                  onClick={() => updateConfig.setCoating(coating.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    config?.coating === coating.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="h-8 rounded mb-2"
                    style={{ backgroundColor: coating.color }}
                  />
                  <div className="text-sm font-medium">{coating.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 w-[400px] bg-white border-t shadow-lg p-4 space-y-3 z-10">
        <div className="flex justify-between items-end">
          <span className="text-lg font-medium">Итого:</span>
          <span className="text-3xl font-bold">
            {isLoading ? "Расчёт..." : price ? `${price.toLocaleString("ru-RU")} ₽` : "—"}
          </span>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Материал:</span>
            <span>{(calculatedResult?.materialCost || 0).toLocaleString("ru-RU")} ₽</span>
          </div>
          <div className="flex justify-between">
            <span>Работа:</span>
            <span>{(calculatedResult?.workCost || 0).toLocaleString("ru-RU")} ₽</span>
          </div>
          <div className="flex justify-between">
            <span>Ограждение:</span>
            <span>{(calculatedResult?.railingCost || 0).toLocaleString("ru-RU")} ₽</span>
          </div>
          <div className="flex justify-between">
            <span>Покрытие:</span>
            <span>{(calculatedResult?.coatingCost || 0).toLocaleString("ru-RU")} ₽</span>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={() => router.push("/checkout")}>
          Оформить заказ
        </Button>
      </div>
    </div>
  );
}