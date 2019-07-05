import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuardService } from './shared/guard/auth-guard.service';

const routes: Routes = [
  { path: '', 
    loadChildren: './layout/layout.module#LayoutModule',
    canActivate: [AuthGuardService],
  },
  {
    path: 'login', loadChildren: './login/login.module#LoginPageModule'
  },
  {
    path: 'signup', loadChildren: './signup/signup.module#SignupPageModule'
  },
  {
    path: 'forgot', loadChildren: './forgot/forgot.module#ForgotPageModule'
  },
  {
    path: 'reset/:token', loadChildren: './reset/reset.module#ResetPageModule'
  },
  { path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
