import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, toODataString } from '@progress/kendo-data-query';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export abstract class NorthwindService extends BehaviorSubject<GridDataResult> {
    public loading: boolean = false;

    private BASE_URL = 'https://demos.telerik.com/kendo-ui/service-v4/odata/';

    constructor(private http: HttpClient, protected tableName: string) {
        super({ data: [], total: null });
    }

    public query(state: State): void {
        this.fetch(this.tableName, state).subscribe((x) => super.next(x));
    }

    protected fetch(tableName: string, state: State): Observable<GridDataResult> {
        const queryStr = `${toODataString(state)}&$count=true`;
        this.loading = true;

        return this.http.get(`${this.BASE_URL}${tableName}?${queryStr}`).pipe(
            map(
                (response: any) =>
                    <GridDataResult>{
                        data: response['value'],
                        total: parseInt(response['@odata.count'], 10),
                    }
            ),
            tap(() => (this.loading = false))
        );
    }
}

@Injectable()
export class ProductsService extends NorthwindService {
    constructor(http: HttpClient) {
        super(http, 'Products');
    }

    public queryForCategory(categoryId: number, state?: State): void {
        this.query(
            Object.assign({}, state, {
                filter: {
                    filters: [
                        {
                            field: 'CategoryID',
                            operator: 'eq',
                            value: categoryId,
                        },
                    ],
                    logic: 'and',
                },
            })
        );
    }

    public queryForProductName(ProductName: string, state?: State): void {
        this.query(
            Object.assign({}, state, {
                filter: {
                    filters: [
                        {
                            field: 'ProductName',
                            operator: 'contains',
                            value: ProductName,
                        },
                    ],
                    logic: 'and',
                },
            })
        );
    }
}

@Injectable()
export class CategoriesService extends NorthwindService {
    constructor(http: HttpClient) {
        super(http, 'Categories');
    }

    queryAll(st?: State): Observable<GridDataResult> {
        const state = Object.assign({}, st);
        delete state.skip;
        delete state.take;

        return this.fetch(this.tableName, state);
    }
}
