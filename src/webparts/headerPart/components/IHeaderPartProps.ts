import { IAnchorItem } from "../../../common/model";
import { NavPosition, NavTheme, NavAlign } from "../../../common/types";

export interface IHeaderPartProps {
  anchors: IAnchorItem[];
  scrollBehavior: ScrollBehavior;
  position: NavPosition;
  theme: NavTheme;
  align: NavAlign;
  isEditMode: boolean;
  homeItem?: string;
}
