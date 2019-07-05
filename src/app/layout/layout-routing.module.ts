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
                    {
                      path: 'detail/:sensorId',
                      loadChildren: './detail/detail.module#DetailPageModule'                    },
                  ]
            },

            { path: 'channel-select', loadChildren: './channel-select/channel-select.module#ChannelSelectPageModule' },
            { path: 'question', loadChildren: './question/question.module#QuestionPageModule' },
            { path: 'notification', loadChildren: './notification/notification.module#NotificationPageModule' },
            { path: 'timeseries', loadChildren: './timeseries/timeseries.module#TimeseriesPageModule' },
            //{ path: 'detail/:sensorId', loadChildren: './detail/detail.module#DetailPageModule' },
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
