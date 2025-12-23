import { useSelector } from "react-redux";
import { RootState } from "store/store";

interface Permission {
  screenName: string;
  actionName: string;
}

export const useRedirectUrl = (): string => {
  const permissions = useSelector(
    (state: RootState) => state.auth.permissions
  ) as Permission[];

  if (!permissions || permissions.length === 0) return "/login";

  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, "-");

  const viewPermission = permissions.find(
    (p) => normalize(p.actionName) === "view"
  );

  if (viewPermission) {
    return normalize(viewPermission.screenName);
  }

  const report = permissions.find((p) => normalize(p.screenName) === "reports");

  if (report) {
    return `reports/${normalize(report.actionName)}`;
  }

  return "/encounters";
};
