import Link from "next/link";
import { LegalDocShell, LegalEntityIntro } from "@/components/legal-doc-shell";

export const metadata = { title: "Файлы cookie — МОСКАСТИНГ" };

export default async function CookiesPage() {
  return (
    <LegalDocShell title="Правила использования файлов cookie">
      <LegalEntityIntro />
      <div className="space-y-5 text-foreground">
        <p className="text-xs text-muted-foreground">Редакция от 31 марта 2026 года</p>

        <h2 className="text-base font-semibold text-foreground">1. Что такое файлы cookie</h2>
        <p>
          Файлы cookie — это небольшие фрагменты данных, которые Сайт сохраняет в браузере или на устройстве Пользователя
          при посещении страниц Сервиса <strong>МОСКАСТИНГ</strong>. Аналогичные технологии (локальное хранилище, пиксели,
          идентификаторы сессии) могут применяться в объёме, необходимом для работы Сайта.
        </p>

        <h2 className="text-base font-semibold text-foreground">2. Кто мы</h2>
        <p>
          Оператор Сайта — лицо, указанное в блоке «Оператор сервиса» на этой странице. В настоящих Правилах слова «мы», «нас»
          означают этого оператора. Юридические реквизиты, адрес, контакт для обращений: см. блок выше (незаполненные
          поля обозначены прочерком —).
        </p>

        <h2 className="text-base font-semibold text-foreground">3. О чём этот документ</h2>
        <p>
          Правила определяют, какие категории cookie и аналогичных технологий могут использоваться, с какими целями, и как
          Пользователь может ограничить их использование в настройках браузера. Правила являются приложением к общему
          порядку обработки данных, описанному в{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-2">
            Политике в области обработки персональных данных
          </Link>
          .
        </p>

        <h2 className="text-base font-semibold text-foreground">4. Типы cookie и цели</h2>
        <ul className="list-inside list-disc space-y-3 pl-1">
          <li>
            <strong>Обязательные (строго необходимые)</strong> — обеспечивают работу Сайта, аутентификацию, безопасность,
            предотвращение мошенничества. Без них невозможны вход в учётную запись и защищённые разделы. К ним относятся, в
            частности, cookie сессии авторизации (например, используемые программной библиотекой NextAuth / Auth.js для
            поддержания сеанса).
          </li>
          <li>
            <strong>Функциональные</strong> — запоминают выбранные Пользователем настройки интерфейса (язык, режим
            отображения и т.п.), если такие функции включены в Сервисе.
          </li>
          <li>
            <strong>Аналитические и статистические</strong> — позволяют в обезличенном или псевдонимизированном виде
            оценивать посещаемость и работу Сайта. Перечень конкретных инструментов аналитики и третьих лиц: — (указывается
            при подключении; до подключения такие cookie не используются или используются только на стороне сервера без
            идентификации личности).
          </li>
          <li>
            <strong>Маркетинговые</strong> — применяются для показа релевантной рекламы на сайтах партнёров только при
            наличии согласия Пользователя и подключения соответствующих сервисов. Текущий статус: — (не используются /
            перечень поставщиков —).
          </li>
        </ul>

        <h2 className="text-base font-semibold text-foreground">5. Поручение обработки и третьи лица</h2>
        <p>
          Привлечение подрядчиков для хостинга, доставки контента, аналитики осуществляется на основании договоров с
          оператором персональных данных. Перечень категорий получателей и целей обработки cookie: — (при необходимости
          публикуется отдельно).
        </p>

        <h2 className="text-base font-semibold text-foreground">6. Срок хранения</h2>
        <p>
          Срок действия cookie зависит от их типа: сеансовые удаляются при закрытии браузера; постоянные хранятся до
          истечения срока, указанного в настройках cookie, либо до удаления Пользователем. Конкретные сроки для cookie
          сессии авторизации определяются настройками Сервиса (например, срок жизни JWT-сессии).
        </p>

        <h2 className="text-base font-semibold text-foreground">7. Как отказаться или ограничить cookie</h2>
        <p>
          Вы можете отключить или удалить cookie в настройках браузера. Обратите внимание: отключение обязательных cookie
          сделает невозможным вход в аккаунт и использование части функций Сайта. Инструкции для распространённых браузеров:
        </p>
        <ul className="list-inside list-disc space-y-1 pl-1 text-sm">
          <li>
            <a
              href="https://support.google.com/accounts/answer/32050"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://browser.yandex.ru/help/personal-data-protection/cookies.html"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Яндекс Браузер
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/ru/kb/udalenie-kukov"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/ru-ru/microsoft-edge"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Edge
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/ru-ru/guide/safari/sfri11471/mac"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safari (Mac)
            </a>
            ;{" "}
            <a
              href="https://support.apple.com/ru-ru/guide/iphone/iphacc5f0202/ios"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safari (iPhone)
            </a>
          </li>
        </ul>

        <h2 className="text-base font-semibold text-foreground">8. Изменение Правил</h2>
        <p>
          Оператор вправе обновлять Правила; дата редакции указывается в начале текста. Рекомендуем периодически
          просматривать эту страницу. По вопросам обработки данных см.{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-2">
            Политику персональных данных
          </Link>{" "}
          и{" "}
          <Link href="/terms" className="text-primary underline underline-offset-2">
            Пользовательское соглашение
          </Link>
          .
        </p>
      </div>
    </LegalDocShell>
  );
}
