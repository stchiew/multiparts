import * as React from 'react';
import styles from './ChildPart.module.scss';
import { IChildPartProps } from './IChildPartProps';
import * as strings from 'IMultiPartStrings';
import { css, ICssInput } from 'office-ui-fabric-react/lib/Utilities';
import { NavPosition } from '../../../common/types';
import { DisplayMode } from '@microsoft/sp-core-library';

export default class ChildPart extends React.Component<IChildPartProps, {}> {

  constructor(props: IChildPartProps) {
    super(props);

    this._onChange = this._onChange.bind(this);
  }
  public render(): React.ReactElement<IChildPartProps> {

    const { title, displayMode, anchorElRef, navPosition } = this.props;
    const anchorElClassNames: ICssInput = {};
    anchorElClassNames[styles.anchorEl] = true;
    if (navPosition === 'section') {
      anchorElClassNames[styles.offset] = true;
    }

    return (
      <div className={css(styles.webPartTitle, styles.visible, 'psn-anchorTitle')}>
        <div className={css(anchorElClassNames)} ref={anchorElRef}></div>
        {
          displayMode === DisplayMode.Edit
            ? <textarea
              placeholder={strings.AnchorTitlePlaceholder}
              aria-label={strings.AnchorTitlePlaceholder}
              onChange={this._onChange}
              defaultValue={title}></textarea>
            : <span className={'psn-anchorTitleText'}>{title}</span>}
      </div>
    );
  }

  /**
   * Process the text area change
   */
  private _onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.props.updateProperty(event.target.value as string);
  }
}
