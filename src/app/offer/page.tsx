import { LegalDocShell, LegalEntityIntro } from "@/components/legal-doc-shell";

export const metadata = { title: "Публичная оферта — МОСКАСТИНГ" };

export default async function OfferPage() {
  return (
    <LegalDocShell title="Публичная оферта">
      <LegalEntityIntro />
      <div className="space-y-4 text-foreground">
        <p>
          Настоящий документ является публичной офертой в адрес потенциальных пользователей сервиса{" "}
          <strong>МОСКАСТИНГ</strong>. Акцептом считается регистрация и/или начало использования функций платформы.
        </p>
        <h2 className="text-base font-semibold text-foreground">1. Услуги</h2>
        <p>
          Оператор обеспечивает доступ к программному обеспечению (веб-сервис) для размещения и просмотра объявлений о
          кастингах, ведения профилей и коммуникаций в рамках платформы. Условия платных услуг (если появятся) будут
          указаны отдельно.
        </p>
        <h2 className="text-base font-semibold text-foreground">2. Порядок оплаты</h2>
        <p>На текущем этапе тарифы и способы оплаты: — (будут дополнены при запуске коммерческих опций).</p>
        <h2 className="text-base font-semibold text-foreground">3. Реквизиты исполнителя</h2>
        <p>— (заполняются после регистрации юридического лица).</p>
      </div>
    </LegalDocShell>
  );
}
