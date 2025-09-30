import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignments } from "../context/assignments-context";
import { useTranslation } from "react-i18next";

export function AssignmentsPrimaryButtons() {
  const { setOpen } = useAssignments();
  const { t } = useTranslation(["assignment"]);

  return (
    <div className="flex gap-1 sm:gap-2 flex-wrap">
      <Button
        className="space-x-1 text-xs sm:text-sm px-2 sm:px-4"
        onClick={() => setOpen("create")}
      >
        <span>{t("buttons.createAssignment")}</span> <UserPlus size={18} />
      </Button>
    </div>
  );
}
