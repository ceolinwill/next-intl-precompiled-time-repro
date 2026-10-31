import { useTranslations } from "next-intl";

const keys = ["time", "timeShort", "timeMedium", "date", "dateShort", "dateMedium"] as const;

export default function Page() {
  const t = useTranslations();
  const value = new Date("2026-09-27T14:30:00Z");

  return (
    <ul>
      {keys.map((key) => (
        <li key={key} data-case={key}>
          {t(key, { value })}
        </li>
      ))}
    </ul>
  );
}
