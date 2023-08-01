import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
// import { escape } from '@microsoft/sp-lodash-subset';
import { Web } from '@pnp/sp/presets/all';
import styles from './AppCustomizer.module.scss';
import * as strings from 'TopNavigationsApplicationCustomizerStrings';

const LOG_SOURCE: string = 'TopNavigationsApplicationCustomizer';

export interface ITopNavigationsApplicationCustomizerProperties {
  NavigationList: string;
  Top: string;
  Bottom: string;
}

export default class TopNavigationsApplicationCustomizer extends BaseApplicationCustomizer<ITopNavigationsApplicationCustomizerProperties> {
  private _topPlaceholder: PlaceholderContent | undefined;
  private _bottomPlaceholder: PlaceholderContent | undefined;
  private _navigationData: any[] = [];

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Wait for the placeholders to be created (or handle them being changed) and then render.
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholders);

    // Fetch the navigation data from the SharePoint list
    return this._fetchNavigationData().then(() => {
      this._renderPlaceholders();
    });
  }

  private _fetchNavigationData(): Promise<void> {
    debugger;
    // alert("Getdata");
    let web = Web(this.context.pageContext.web.absoluteUrl);
    const listName = "PageNavigation";
    return web.lists.getByTitle(listName).items.select('NavigationData').get().then((data: any[]) => {
      let navigationData: any = data.map(item => JSON.parse(item.NavigationData));
      console.log(navigationData);
      this._navigationData = navigationData[0];
    }).catch((error: any) => {
      console.log(error);
    });
  }

  // private _fetchNavigationData(): Promise<void> {
  //   debugger;
  //   // const listName = this.properties.NavigationList;
  //   const listName = "PageNavigation";

  //   const web = Web(this.context.pageContext.web.absoluteUrl);

  //   return web.lists.getByTitle(listName).items.select('NavigationData').get().then((data: any[]) => {
  //     this._navigationData = data.map(item => JSON.parse(item.NavigationData));
  //   }).catch((error: any) => {
  //     console.log(`${LOG_SOURCE}:: Error occurred while fetching navigation data: ${error}`);
  //   });
  // }
  private _renderPlaceholders(): void {
    // Handling the top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });
    }
  
    if (this._topPlaceholder && this._navigationData.length > 0) {
      const navMenu = this._createNavigationMenu(this._navigationData);
  
      // Get the header row element
      const siteHeader = document.querySelector('.headerRow-49');
  
      // The extension should not assume that the header row element is available.
      if (!siteHeader) {
        console.error("The header row element with class 'headerRow-49' was not found.");
        return;
      }
  
      // Create a container div for the top placeholder
      const placeholderContainer = document.createElement('div');
      placeholderContainer.className = styles.app;
      placeholderContainer.innerHTML = navMenu;
  
      // Insert the top placeholder below the header row
      siteHeader.parentElement?.insertBefore(
        this._topPlaceholder.domElement,
        siteHeader.nextSibling
      );
  
      // Append the container div to the top placeholder
      this._topPlaceholder.domElement.appendChild(placeholderContainer);
    }

    const headerRow = document.querySelector('.headerRow-49');

  // Add the new CSS class to the headerRow element
  if (headerRow) {
    headerRow.classList.add('header-image');
    
  }
  // Get the header row element
  const siteHeader = document.querySelector('.headerRow-49') as HTMLElement; // Explicit type casting

  // The extension should not assume that the header row element is available.
  if (!siteHeader) {
    console.error("The header row element with class 'headerRow-49' was not found.");
    return;
  }

  // Apply the background image style to the headerRow-49 element
  siteHeader.style.backgroundImage = "url('https://ignatiuzsoftware.sharepoint.com/DhondibaSubsite/Shared%20Documents/Laptop.jpg')";
  siteHeader.style.backgroundSize = 'cover';
  siteHeader.style.backgroundPosition = 'center';

  
    // Handling the bottom placeholder
    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom, { onDispose: this._onDispose });
    }


    if (this._bottomPlaceholder && this._navigationData.length > 0) {
      // Create a container div for the bottom placeholder
      const placeholderContainer = document.createElement('div');
      placeholderContainer.className = `${styles.app} ${styles.bottomPlaceholderContainer}`;

      // Create the bottom navbar
      const bottomNavbar = document.createElement('nav');
      bottomNavbar.className = 'bottommenu'; // Apply your CSS class here
      bottomNavbar.style.textAlign = 'center'; // Apply text-align center

      // Create the unordered list (ul) inside the bottom navbar
      const menuList = document.createElement('ul');
      menuList.style.display = 'flex'; // Display items horizontally
      menuList.style.listStyle = 'none'; // Remove bullets (dots)
      menuList.style.padding = '0'; // Remove default padding
      menuList.style.margin = '0'; // Remove default margin

      // Generate list items (li) from the navigation data
      this._navigationData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.style.padding = '0 10px'; // Add padding space between menu items
        listItem.style.position = 'relative'; // Add relative positioning for the vertical line

        const link = document.createElement('a');
        link.href = item.url;
        link.style.textDecoration = 'none'; // Remove underline
        link.style.color = 'white';
        link.style.display = 'block'; // Change to block-level element to make verticalLine work
        link.textContent = item.title;
        listItem.appendChild(link);
        menuList.appendChild(listItem);

        // Add vertical line between menu items, except for the last item
        if (item !== this._navigationData[this._navigationData.length - 1]) {
          const verticalLine = document.createElement('div');
          verticalLine.style.content = '';
          verticalLine.style.position = 'absolute';
          verticalLine.style.width = '1px';
          verticalLine.style.height = '80%'; // Adjust the height of the line as needed
          verticalLine.style.backgroundColor = 'white';
          verticalLine.style.top = '10%'; // Adjust the position of the line as needed
          verticalLine.style.right = '-5px'; // Adjust the position of the line as needed
          listItem.appendChild(verticalLine);
        }
      });

      // Append the unordered list (ul) to the bottom navbar
      bottomNavbar.appendChild(menuList);

      // Append the bottom navbar to the container div
      placeholderContainer.appendChild(bottomNavbar);

      // Append the container div to the bottom placeholder
      this._bottomPlaceholder.domElement.appendChild(placeholderContainer);
    }


  }

// private _createBottomNavigationMenu(navigationItems: any[]): string {
//   let html = '<ul class="bottommenu">';

//   navigationItems.forEach(item => {
//     html += `<li>${this._createBottomMenuItem(item)}</li>`;
//   });

//   html += '</ul>';
//   return html;
// }


// private _createBottomMenuItem(item: any): string {
//   return `<a href="${item.url}">${item.title}</a>`;
// }

  
 
  private _onDispose(): void {
    console.log(`${LOG_SOURCE}:: Disposed custom top and bottom placeholders.`);
  }

  private _createNavigationMenu(navigationItems: any[]): string {
    debugger;
    let html = `<nav class="${styles.menu}"><ul>`;
    navigationItems.forEach(item => {
      html += `<li>${this._createMenuItem(item)}</li>`;
    });
    html += `</ul></nav>`;
    return html;
  }

  private _createMenuItem(item: any): string {
    let html = `<a href="${item.url}">${item.title}</a>`;
    if (item.children && item.children.length > 0) {
      html += `<ul>`;
      item.children.forEach((childItem: any) => {
        html += `<li>${this._createMenuItem(childItem)}</li>`;
      });
      html += `</ul>`;
    }
    return html;
  }
}

