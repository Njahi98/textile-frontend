import { useTranslation } from "react-i18next";

interface Props {
  days: number;
  onChangeDays: (d: number) => void;
}

export default function Header({ days, onChangeDays }: Props) {
  const { t } = useTranslation(['auditStats']);
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">{t('stats.pageTitle')}</h1>
        <p className="text-muted-foreground">{t('stats.pageDescription')}</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">{t('stats.filters.days')}</label>
        <select
          className="rounded-md border bg-background px-2 py-1 text-sm"
          value={days}
          onChange={(e) => onChangeDays(parseInt(e.target.value, 10))}
        >
          <option value={7}>7</option>
          <option value={14}>14</option>
          <option value={30}>30</option>
          <option value={60}>60</option>
          <option value={90}>90</option>
        </select>
      </div>
    </div>
  );
}


