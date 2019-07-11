import { ViewTextComponent } from './components/view-text/view-text.component';
import { ViewSourcePage } from './view-source.page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrendComponent } from './components/trend/trend.component';
import { StorageComponent } from './components/storage/storage.component';

const routes: Routes = [
    {
        path: '',
        component: ViewSourcePage,
        children: [
            { path: '', redirectTo: 'trend', pathMatch: 'full' },
            { path: 'trend/:sensorId', component: TrendComponent },
            { path: 'view-text/:sensorId', component: ViewTextComponent },
            { path: 'storage/:sensorId', component: StorageComponent },
        ]
    },
    {
        path: '',
        redirectTo: 'trend',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewSourceRoutingModule {}
