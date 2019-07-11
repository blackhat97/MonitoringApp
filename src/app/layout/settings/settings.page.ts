import { Storage } from '@ionic/storage';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { GetApiService } from '../../shared/services/get-api.service';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  USER_ID = environment.user_id;

  sensorId: string;
  infos: any;
  limit: any;
  schedule: any;

  stIntervals: Array<number> = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  selectNums: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(
    private getapi: GetApiService,
    public storage: Storage,
    public loadingController: LoadingController,
    public alertCtrl: AlertController,
    private activatedRoute: ActivatedRoute,

  ) { 
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');

  }

  ionViewWillEnter(){

    this.storage.ready().then(() => {
      this.storage.get(this.USER_ID).then(userId => {
        this.getapi.getInfoBasic(this.sensorId, userId).subscribe((res: any) => {
          this.infos = res;
        });
        this.getapi.getInfoLimits(this.sensorId, userId).subscribe((res: any) => {
          this.limit = res[0];

        });
      });
    });

    this.getapi.getInfoSchedule(this.sensorId).subscribe((res: any) => {
      this.schedule = res[0];

    });
  }


  showAlert() {
    let alert = this.alertCtrl.create({
      header: '암호를 입력하세요!',
      message: '암호 입력',
      inputs: [
        {
          type: 'password',
          name: 'pass',
          placeholder: '비밀번호'
        },
      ],
      buttons: [{
          text: '확인',
          role: 'submit',
          handler: (data) => {
            console.log(data.pass);

          }
        }]
    });
    alert.then(alert => alert.present());
  }

}
