import { NavPosition } from '../../../common/types';
import { DisplayMode } from '@microsoft/sp-core-library';

export interface IChildPartProps {
  displayMode: DisplayMode;
  title: string;
  updateProperty: (value: string) => void;
  anchorElRef: (el: HTMLDivElement) => void;
  navPosition: NavPosition;
}
