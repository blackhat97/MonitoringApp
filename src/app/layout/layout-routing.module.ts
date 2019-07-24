import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'prefix' },
            { path: 'home', loadChildren: './home/home.module#HomePageModule' },
            { 
                path: 'home', 
                children: [
                    {
                      path: '',
                      loadChildren: './home/home.module#HomePageModule' 
                    },
                  ]
            },
            { path: 'view-source', loadChildren: './view-source/view-source.module#ViewSourcePageModule' },
            { path: 'settings/:sensorId', loadChildren: './settings/settings.module#SettingsPageModule' },
            { path: 'question', loadChildren: './question/question.module#QuestionPageModule' },
            {
                path: 'profile',
                children: [
                  {
                    path: '',
                    loadChildren: './profile/profile.module#ProfilePageModule'
                  },
                  {
                    path: 'push-setting',
                    loadChildren: './push-setting/push-setting.module#PushSettingPageModule'
                  },
                ]
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}
