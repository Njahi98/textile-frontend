import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface UserDetails  {
  username?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
};

interface Props  { user: UserDetails };

export default function CurrentAccountCard({ user }: Props) {
  const { t } = useTranslation(["accountSettings"]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sections.currentAccount.title")}</CardTitle>
        <CardDescription>{t("sections.currentAccount.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">{t("fields.username")}</Label>
            <p className="text-sm text-muted-foreground">{user?.username}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">{t("fields.email")}</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">{t("fields.role")}</Label>
            <p className="text-sm text-muted-foreground">{user?.role}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">{t("fields.status")}</Label>
            <p className="text-sm text-muted-foreground">{user?.status}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">{t("fields.firstName")}</Label>
            <p className="text-sm text-muted-foreground">{user?.firstName ?? t("common.notSet")}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">{t("fields.lastName")}</Label>
            <p className="text-sm text-muted-foreground">{user?.lastName ?? t("common.notSet")}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">{t("fields.phone")}</Label>
            <p className="text-sm text-muted-foreground">{user?.phone ?? t("common.notSet")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


