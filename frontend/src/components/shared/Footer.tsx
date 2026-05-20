import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Лестницы на заказ</h3>
            <p className="text-sm">
              Проектирование и изготовление деревянных лестниц любой сложности.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">
                  Портфолио
                </Link>
              </li>
              <li>
                <Link href="/configurator" className="hover:text-white transition-colors">
                  Конфигуратор
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm">
              <li>Телефон: +7 (999) 123-45-67</li>
              <li>Email: info@stairs.local</li>
              <li>Адрес: г. Москва, ул. Примерная, д. 1</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Режим работы</h4>
            <ul className="space-y-2 text-sm">
              <li>Пн-Пт: 9:00 - 18:00</li>
              <li>Сб-Вс: по договорённости</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {currentYear} Лестницы на заказ. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}