export interface ScreenAction {
  actionId: number;
  actionName: string;
}

export interface Screen {
  screenId: number;
  screenName: string;
  actions: ScreenAction[];
}
