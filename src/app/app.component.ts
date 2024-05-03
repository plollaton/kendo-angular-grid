import { Component, ViewChild, OnInit, AfterViewInit } from "@angular/core";
import { Observable } from "rxjs";
import { GridComponent, GridDataResult } from "@progress/kendo-angular-grid";
import { CategoriesService } from "./northwind.service";
import { isDocumentAvailable } from '@progress/kendo-angular-common';

@Component({
  providers: [CategoriesService],
  selector: "my-app",
  template: `
    <kendo-grid
      [data]="gridData | async"
      [loading]="isLoading"
      [height]="550"
      [navigable]="true"
    >
      <kendo-grid-column field="CategoryID" [width]="100"></kendo-grid-column>
      <kendo-grid-column
        field="CategoryName"
        [width]="200"
        title="Category Name"
      ></kendo-grid-column>
      <kendo-grid-column field="Description"> </kendo-grid-column>
      <div *kendoGridDetailTemplate="let dataItem">
        <category-details [category]="dataItem"></category-details>
      </div>
    </kendo-grid>
  `
})
export class AppComponent implements OnInit, AfterViewInit {
  public gridData: Observable<GridDataResult>;
  public isLoading: boolean;

  @ViewChild(GridComponent) grid: GridComponent;

  constructor(private service: CategoriesService) {}

  public ngOnInit(): void {
    // Bind the Grid data directly to the service as it is a BehaviorSubject of type GridDataResult.
    this.gridData = this.service;
    this.isLoading = this.service.loading;

    this.loadData();
  }

  public ngAfterViewInit(): void {
    if (!isDocumentAvailable()) {
        return;
    }

    // Expand the first row initially.
    this.grid.expandRow(0);
  }

  private loadData(): void {
    this.service.query({
      skip: 0,
      take: 8
    });
  }
}
