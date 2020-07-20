import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'IMultiPartStrings';
import ChildPart from './components/ChildPart';
import { IChildPartProps } from './components/IChildPartProps';
import { IDynamicDataPropertyDefinition, IDynamicDataCallables, IDynamicDataSource } from '@microsoft/sp-dynamic-data';
import { IAnchorItem } from '../../common/model';
import { NavPosition } from '../../common/types';

export interface IChildPartWebPartProps {
  title: string;
  uniqueId: string;
}

export default class ChildPartWebPart extends BaseClientSideWebPart<IChildPartWebPartProps> implements IDynamicDataCallables {
  private _anchor: IAnchorItem;
  private _pageNavDataSource: IDynamicDataSource | undefined;

  protected onInit(): Promise<void> {
    const {
      title,
      uniqueId
    } = this.properties;

    this._anchor = {
      title: title,
      uniqueId: uniqueId
    };

    this._initDataSource = this._initDataSource.bind(this);
    this._onPageNavPositionChanged = this._onPageNavPositionChanged.bind(this);

    // getting data sources that have already been added on the page
    this._initDataSource();
    // registering for changes in available datasources
    this.context.dynamicDataProvider.registerAvailableSourcesChanged(this._initDataSource);
    this.context.dynamicDataSourceManager.initializeSource(this);
    if (!uniqueId) {
      this._anchor.uniqueId = this.properties.uniqueId = `pagenavanchor-${this.context.instanceId}`;
      this.context.dynamicDataSourceManager.notifyPropertyChanged('anchor');
    }
    return super.onInit();
  }

  public render(): void {
    const { title } = this.properties;
    const position: NavPosition = this._pageNavDataSource ? this._pageNavDataSource.getPropertyValue('position') : 'top';
    const element: React.ReactElement<IChildPartProps> = React.createElement(
      ChildPart,
      {
        displayMode: this.displayMode,
        title: title,
        updateProperty: this._onTitleChanged.bind(this),
        anchorElRef: (el => {
          if (!this.isDisposed) {
            // notifying subscribers that the anchor component has been rendered
            this._anchor.domElement = el;
            this.context.dynamicDataSourceManager.notifyPropertyChanged('anchor');
          }
        }),
        navPosition: position
      }
    );

    ReactDom.render(element, this.domElement);
  }

  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {
    return [{
      id: 'anchor',
      title: 'Anchor'
    }];
  }

  public getPropertyValue(propertyId: string): IAnchorItem {
    switch (propertyId) {
      case 'anchor':
        return this._anchor;
    }

    throw new Error('Bad property id');
  }
  protected onDispose(): void {
    this.context.dynamicDataProvider.unregisterAvailableSourcesChanged(this._initDataSource);
    if (this._pageNavDataSource) {
      this.context.dynamicDataProvider.unregisterPropertyChanged(this._pageNavDataSource.id, 'position', this._onPageNavPositionChanged);
      delete this._pageNavDataSource;
    }
    ReactDom.unmountComponentAtNode(this.domElement);
    delete this._anchor;
    super.onDispose();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Child Part'
          },
          groups: [{
            groupName: strings.NavAnchorGroupName,
            groupFields: []
          }]
        }
      ]
    };
  }

  private _onTitleChanged(title: string) {
    this._anchor.title = this.properties.title = title;
    // notifying that web part's title has been changed
    this.context.dynamicDataSourceManager.notifyPropertyChanged('anchor');
  }

  /**
 * Initializes "master" data source
 */
  private _initDataSource(): void {
    // all data sources on the page
    const availableDataSources = this.context.dynamicDataProvider.getAvailableSources();
    //
    // searching for "master" data source
    //
    let hasPageNavDataSource = false;
    for (let i = 0, len = availableDataSources.length; i < len; i++) {
      let dataSource = availableDataSources[i];
      if (dataSource.getPropertyDefinitions().filter(pd => pd.id === 'position').length) {
        this._pageNavDataSource = dataSource;
        this.context.dynamicDataProvider.registerPropertyChanged(dataSource.id, 'position', this._onPageNavPositionChanged);
        hasPageNavDataSource = true;
        break;
      }
    }

    if (!hasPageNavDataSource && this._pageNavDataSource) {
      this._pageNavDataSource = undefined;
    }
  }

  private _onPageNavPositionChanged() {
    this.render();
  }
}
