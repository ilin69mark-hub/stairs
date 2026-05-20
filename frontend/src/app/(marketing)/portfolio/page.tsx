"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCatalog, type CatalogResponse } from "@/lib/api";
import Link from "next/link";

interface Project {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  type: string;
  material: string;
  price: number;
  timeline: string;
  description?: string;
}

const mockProjects: Project[] = [
  { id: "1", slug: "dubovaya-pryamaya", name: "Лестница из дуба", type: "Прямая", material: "Дуб", price: 185000, timeline: "25 дней", imageUrl: "" },
  { id: "2", slug: "vintsovaya-metall", name: "Винтовая металлическая", type: "Винтовая", material: "Металл", price: 145000, timeline: "20 дней", imageUrl: "" },
  { id: "3", slug: "g-obraznaya-buk", name: "Г-образная из бука", type: "Г-образная", material: "Бук", price: 210000, timeline: "30 дней", imageUrl: "" },
  { id: "4", slug: "pryamaya-yasen", name: "Прямая из ясеня", type: "Прямая", material: "Ясень", price: 165000, timeline: "22 дня", imageUrl: "" },
  { id: "5", slug: "u-obraznaya-dub-metal", name: "U-образная комбинированная", type: "U-образная", material: "Дуб + металл", price: 280000, timeline: "35 дней", imageUrl: "" },
  { id: "6", slug: "pryamaya-sosna", name: "Экономичная из сосны", type: "Прямая", material: "Сосна", price: 95000, timeline: "18 дней", imageUrl: "" },
  { id: "7", slug: "g-obraznaya-dub", name: "Г-образная с площадкой", type: "Г-образная", material: "Дуб", price: 245000, timeline: "28 дней", imageUrl: "" },
  { id: "8", slug: "vintsovaya-dub", name: "Винтовая деревянная", type: "Винтовая", material: "Дуб", price: 175000, timeline: "24 дня", imageUrl: "" },
  { id: "9", slug: "pryamaya-fasad", name: "Наружная лестница", type: "Прямая", material: "Металл", price: 125000, timeline: "15 дней", imageUrl: "" },
];

const stairTypes = ["Все", "Прямая", "Г-образная", "U-образная", "Винтовая"];
const materials = ["Все", "Дуб", "Бук", "Ясень", "Сосна", "Металл", "Дуб + металл"];

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(mockProjects);
  const [selectedType, setSelectedType] = useState("Все");
  const [selectedMaterial, setSelectedMaterial] = useState("Все");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  useEffect(() => {
    let filtered = projects;
    
    if (selectedType !== "Все") {
      filtered = filtered.filter(p => p.type === selectedType);
    }
    
    if (selectedMaterial !== "Все") {
      filtered = filtered.filter(p => p.material.includes(selectedMaterial));
    }
    
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [selectedType, selectedMaterial, projects]);

  const paginatedProjects = filteredProjects.slice(0, currentPage * projectsPerPage);
  const hasMore = paginatedProjects.length < filteredProjects.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center"
          >
            Портфолио
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 text-center mt-4"
          >
            Наши реализованные проекты
          </motion.p>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {stairTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {materials.map(material => (
                <button
                  key={material}
                  onClick={() => setSelectedMaterial(material)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMaterial === material
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedProject(project)}
              >
                <div className="h-64 bg-gray-200 relative overflow-hidden">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium">
                    {project.price.toLocaleString("ru-RU")} ₽
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {project.type}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {project.material}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {project.timeline}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Показать ещё
              </button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-80 bg-gray-200">
                {selectedProject.imageUrl ? (
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedProject.price.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {selectedProject.type}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {selectedProject.material}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Срок изготовления: {selectedProject.timeline}
                </div>
                <p className="text-gray-600 mb-6">
                  Индивидуальная лестница по проекту. Изготовлена из качественных материалов с учётом всех пожеланий заказчика.
                </p>
                <div className="flex gap-4">
                  <Link
                    href={`/configurator?type=${selectedProject.type.toLowerCase()}`}
                    className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Заказать похожую
                  </Link>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}