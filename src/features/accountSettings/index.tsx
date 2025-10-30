import { Main } from "@/components/layout/main";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSWR, { type SWRResponse } from "swr";
import { accountApi } from "@/services/account.api";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import ProfilePictureCard from "./components/ProfilePictureCard";
import CurrentAccountCard from "./components/CurrentAccountCard";
import UpdateAccountForm from "./components/UpdateAccountForm";
import DangerZoneCard from "./components/DangerZoneCard";

export default function AccountSettings() {
  const { logout } = useAuthStore();
  const { t } = useTranslation(["accountSettings"]);

  interface AccountUser {
    username?: string | null;
    email?: string | null;
    role?: string | null;
    status?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  }
  interface AccountSettingsResponse { user: AccountUser }

  const fetcher: () => Promise<AccountSettingsResponse> = () => accountApi.getAccountSettings();
  const swr: SWRResponse<AccountSettingsResponse, unknown> = useSWR<AccountSettingsResponse>(
    "/api/settings/account",
    fetcher
  );

  const accountData = swr.data;
  const error = swr.error;
  const isLoading = !swr.data && !swr.error;
  const mutateAccount = swr.mutate;

  const user = accountData?.user;

  if (isLoading) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Main>
    );
  }

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{t("messages.loadingError")}</p>
              <Button onClick={() => { void mutateAccount(); }} variant="outline" className="mt-4">
                {t("buttons.tryAgain")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Main>
    );
  }

  if (!user) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="p-6">
              <p>{t("messages.noAccountData")}</p>
            </CardContent>
          </Card>
        </div>
      </Main>
    );
  }

  return (
    <Main>
      <div className="mb-6 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h2>
          <p className="text-muted-foreground">{t("pageDescription")}</p>
        </div>
      </div>

      <div className="space-y-6">
        <ProfilePictureCard user={user} onMutate={() => { void mutateAccount(); }} />
        <CurrentAccountCard user={user} />
        <UpdateAccountForm user={user} onMutate={() => { void mutateAccount(); }} />
        <Separator />
        <DangerZoneCard onLogout={() => { void logout(); }} />
      </div>
    </Main>
  );
}