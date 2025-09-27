import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundError() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">404</h1>
        <span className="font-medium">{t("notFound.title")}</span>
        <p className="text-muted-foreground text-center">
          {t("notFound.description")}
        </p>
        <div className="mt-6 flex gap-4 *:cursor-pointer">
          <Button variant="outline" onClick={() => void navigate(-1)}>
            {t("notFound.goBack")}
          </Button>
          <Button onClick={() => void navigate("/")}>
            {t("notFound.backHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
