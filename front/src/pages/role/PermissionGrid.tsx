import { Checkbox } from "components/ui/checkbox";
import { Label } from "components/ui/label";
import { Screen } from "hooks/types/screen";

interface PermissionGridProps {
  screens: Screen[];
  selectedPermissions: { screenId: number; screenActionId: number }[];
  onPermissionsChange: (
    permissions: { screenId: number; screenActionId: number }[]
  ) => void;
}

export function PermissionGrid({
  screens,
  selectedPermissions,
  onPermissionsChange,
}: PermissionGridProps) {
  const isPermissionSelected = (screenId: number, actionId: number) => {
    return selectedPermissions.some(
      (p) => p.screenId === screenId && p.screenActionId === actionId
    );
  };

  const isScreenFullySelected = (screen: Screen) => {
    return screen.actions.every((action) =>
      isPermissionSelected(screen.screenId, action.actionId)
    );
  };

  // Toggle individual action
  const toggleAction = (screenId: number, actionId: number) => {
    if (isPermissionSelected(screenId, actionId)) {
      onPermissionsChange(
        selectedPermissions.filter(
          (p) => !(p.screenId === screenId && p.screenActionId === actionId)
        )
      );
    } else {
      onPermissionsChange([
        ...selectedPermissions,
        { screenId, screenActionId: actionId },
      ]);
    }
  };

  const toggleScreen = (screen: Screen) => {
    if (isScreenFullySelected(screen)) {
      // Remove all actions for this screen
      onPermissionsChange(
        selectedPermissions.filter((p) => p.screenId !== screen.screenId)
      );
    } else {
      const screenPermissions = screen.actions.map((action) => ({
        screenId: screen.screenId,
        screenActionId: action.actionId,
      }));

      const otherPermissions = selectedPermissions.filter(
        (p) => p.screenId !== screen.screenId
      );
      onPermissionsChange([...otherPermissions, ...screenPermissions]);
    }
  };

  const generateScreenName = (name: string) => name.replace(/-/g, " ");

  return (
    <div className="mt-5">
      <h3 className="font-semibold mb-3 text-gray-500">Permissions</h3>

      {/* two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {screens.map((screen) => (
          <fieldset
            key={screen.screenId}
            className="border border-gray-300 p-4 rounded"
          >
            {/* LEGEND */}
            <legend className="flex items-center gap-2 px-2 text-gray-800 font-medium">
              <Checkbox
                id={`screen-${screen.screenId}`}
                checked={isScreenFullySelected(screen)}
                onCheckedChange={() => toggleScreen(screen)}
                className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600"
              />

              <Label
                htmlFor={`screen-${screen.screenId}`}
                className="cursor-pointer text-gray-700"
              >
                <span className="capitalize">{screen.screenName}</span>
              </Label>
            </legend>

            {/* ACTIONS GRID */}
            <div className="grid grid-cols-2 gap-y-6 mt-2 ml-6">
              {screen.actions.map((action) => (
                <label
                  key={action.actionId}
                  htmlFor={`action-${screen.screenId}-${action.actionId}`}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    id={`action-${screen.screenId}-${action.actionId}`}
                    checked={isPermissionSelected(
                      screen.screenId,
                      action.actionId
                    )}
                    onCheckedChange={() =>
                      toggleAction(screen.screenId, action.actionId)
                    }
                    className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600"
                  />
                  {generateScreenName(action.actionName)}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
