import { AuthenticationService } from './../shared/services/authentication.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage {

  forgotForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private authSerivce: AuthenticationService,
  ) {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.authSerivce.forgot(this.forgotForm.value).subscribe();
    this.presentToast("이메일로 발송되었습니다.")
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      position: 'bottom',
      duration: 2000
  });
  toast.present();
  }


}
