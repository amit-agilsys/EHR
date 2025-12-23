import { useSelector } from "react-redux";
import { RootState } from "store/store";

interface Permission {
  screenName: string;
  actionName: string;
}

export const usePermission = (screenName?: string) => {
  const permissions = useSelector(
    (state: RootState) => state.auth.permissions
  ) as Permission[];

  // Normalize string for comparison
  const normalize = (str: string) => str.toLowerCase().trim();

  // Check single permission
  const hasPermission = (action: string, screen?: string): boolean => {
    const targetScreen = screen || screenName;
    if (!targetScreen) {
      console.warn("Screen name is required for permission check");
      return false;
    }

    return permissions.some(
      (permission) =>
        normalize(permission.screenName) === normalize(targetScreen) &&
        normalize(permission.actionName) === normalize(action)
    );
  };

  // Check if user has ANY of the specified actions
  const hasAnyPermission = (actions: string[], screen?: string): boolean => {
    const targetScreen = screen || screenName;
    if (!targetScreen) {
      console.warn("Screen name is required for permission check");
      return false;
    }

    return actions.some((action) =>
      permissions.some(
        (permission) =>
          normalize(permission.screenName) === normalize(targetScreen) &&
          normalize(permission.actionName) === normalize(action)
      )
    );
  };

  // Check if user has ALL of the specified actions
  const hasAllPermissions = (actions: string[], screen?: string): boolean => {
    const targetScreen = screen || screenName;
    if (!targetScreen) {
      console.warn("Screen name is required for permission check");
      return false;
    }

    return actions.every((action) =>
      permissions.some(
        (permission) =>
          normalize(permission.screenName) === normalize(targetScreen) &&
          normalize(permission.actionName) === normalize(action)
      )
    );
  };

  // Check if user has any access to a screen
  const hasScreenAccess = (screen?: string): boolean => {
    const targetScreen = screen || screenName;
    if (!targetScreen) return false;

    return permissions.some(
      (permission) =>
        normalize(permission.screenName) === normalize(targetScreen)
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasScreenAccess,
    permissions,
  };
};
