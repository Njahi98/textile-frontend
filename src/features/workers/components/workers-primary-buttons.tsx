import { Button } from "@/components/ui/button";
import { useWorkers } from "../context/workers-context";
import { Upload, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WorkersPrimaryButtons() {
  const { setOpen } = useWorkers();
  const { t } = useTranslation(["workers"]);

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        className="space-x-1 text-xs sm:text-sm px-2 sm:px-6"
        onClick={() => setOpen("import")}
      >
        <span>{t("buttons.import")}</span> <Upload size={18} />
      </Button>
      <Button
        className="space-x-1 text-xs sm:text-sm px-2 sm:px-6"
        onClick={() => setOpen("add")}
      >
        <span>{t("buttons.addWorker")}</span> <UserPlus size={18} />
      </Button>
    </div>
  );
}
