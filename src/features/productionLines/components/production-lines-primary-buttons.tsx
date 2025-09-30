import { Button } from "@/components/ui/button";
import { useProductionLines } from "../context/production-lines-context";
import { PackagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ProductionLinesPrimaryButtons() {
  const { setOpen } = useProductionLines();
  const { t } = useTranslation(["productionLines"]);
  return (
    <div className="flex gap-1 sm:gap-2 flex-wrap">
      <Button
        className="space-x-1 text-xs sm:text-sm px-2 sm:px-4"
        onClick={() => setOpen("add")}
      >
        <span>{t("buttons.addProductionLine")}</span> <PackagePlus size={18} />
      </Button>
    </div>
  );
}
