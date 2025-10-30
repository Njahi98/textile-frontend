import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface Props {
  workers: { id: number; name: string }[];
  productionLines: { id: number; name: string }[];
  filterWorkerId?: number;
  filterProductionLineId?: number;
  setFilterWorkerId: (id: number | undefined) => void;
  setFilterProductionLineId: (id: number | undefined) => void;
}

export default function CalendarFilters({ workers, productionLines, filterWorkerId, filterProductionLineId, setFilterWorkerId, setFilterProductionLineId }: Props) {
  const { t } = useTranslation(["assignment"]);
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
      <Select
        value={filterWorkerId?.toString() ?? "all"}
        onValueChange={(value) => setFilterWorkerId(value === "all" ? undefined : parseInt(value))}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder={t('calendar.filters.allWorkers')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('calendar.filters.allWorkers')}</SelectItem>
          {workers.map((worker) => (
            <SelectItem key={worker.id} value={worker.id.toString()}>
              {worker.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filterProductionLineId?.toString() ?? "all"}
        onValueChange={(value) => setFilterProductionLineId(value === "all" ? undefined : parseInt(value))}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder={t('calendar.filters.allProductionLines')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('calendar.filters.allProductionLines')}</SelectItem>
          {productionLines.map((line) => (
            <SelectItem key={line.id} value={line.id.toString()}>
              {line.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


