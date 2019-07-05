import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { environment } from './../../../../../environments/environment.prod';
import { Storage } from '@ionic/storage';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { GetApiService } from '../../../../shared/services/get-api.service';
import { PostApiService } from '../../../../shared/services/post-api.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  USER_ID = environment.user_id;
  
  infoForm: FormGroup;
  isEditItems: boolean;
  sensorId: string;
  infos: any;
  limit: any;
  schedule: any;

  maxState: boolean;
  minState: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private getapi: GetApiService,
    private postapi: PostApiService,
    public storage: Storage,
    private activatedRoute: ActivatedRoute,
    public loadingController: LoadingController,
    public alertCtrl: AlertController,
    private toastController: ToastController,

  ) { 
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');
 
    this.infoForm =  this.formBuilder.group({
      value_max: [''],
      value_min: [''],
    });

    this.getapi.getInfoSchedule(this.sensorId).subscribe((res: any) => {
      this.schedule = res[0];
    });
  }

  ngOnInit() {

    this.storage.ready().then(() => {
      this.storage.get(this.USER_ID).then(userId => {
        this.getapi.getInfoBasic(this.sensorId, userId).subscribe((res: any) => {
          this.infos = res;
        });
        this.getapi.getInfoLimits(this.sensorId, userId).subscribe((res: any) => {
          this.limit = res[0];

          this.maxState = res[0].bool_max ? res[0].bool_max : 0;
          this.minState = res[0].bool_min ? res[0].bool_min : 0;              

        });
      });
    });

  }

  onEditCloseItems() {
    this.isEditItems = !this.isEditItems;
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
        message: msg,
        position: 'bottom',
        duration: 2500
    });
    toast.present();
  }


  maxToggleChanged() {
    this.storage.get(this.USER_ID).then(userId => {
      let value = {sensor_id: this.sensorId, position: "max", user_id: userId, bool: this.maxState};
      this.postapi.booleanLimits(value).subscribe();

    });
  }

  minToggleChanged() {
    this.storage.get(this.USER_ID).then(userId => {
      let value = {sensor_id: this.sensorId, user_id: userId, position: "min", bool: this.minState};
      this.postapi.booleanLimits(value).subscribe();

    });
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 500,
      spinner: 'circles',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

  onSubmit() {
    this.storage.get(this.USER_ID).then(userId => {
      this.postapi.updateLimits(this.sensorId, userId, this.infoForm.value).subscribe((res: any) => {
        this.presentToast(res.success);
        this.presentLoading();
        this.onEditCloseItems();
        this.getapi.getInfoLimits(this.sensorId, userId).subscribe((res: any) => {
          this.limit = res[0];
        });
        this.getapi.getInfoSchedule(this.sensorId).subscribe((res: any) => {
          this.schedule = res[0];
        });
      });
    });
  }

  async channelPrompt(id, name) {
    const alert = await this.alertCtrl.create({
      header: '채널명 변경',
      inputs: [
        {
          name: 'ch_name',
          value: name,
          placeholder: '채널명입력'
        },
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel'
        },
        {
          text: '확인',
          role: 'submit',
          handler: data => {
            if(data.ch_name != "") {
              let value = { "name": data.ch_name };
              this.postapi.editChannelName(id, value).subscribe( (res: any) => {  
                this.presentToast(res.success);
                this.storage.get(this.USER_ID).then(userId => {
                  this.getapi.getInfoBasic(this.sensorId, userId).subscribe((res: any) => {
                    this.infos = res;
                  });
                });
              });
            } else {
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async sensorPrompt(id, name) {
    const alert = await this.alertCtrl.create({
      header: '측정명 변경',
      inputs: [
        {
          name: 'name_tag',
          value: name,
          placeholder: '측정명입력'
        },
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel'
        },
        {
          text: '확인',
          role: 'submit',
          handler: data => {
            if(data.name_tag != "") {
              let value = { "name": data.name_tag };
              this.postapi.editSensorName(id, value).subscribe( (res: any) => {  
                this.presentToast(res.success);
                this.storage.get(this.USER_ID).then(userId => {
                  this.getapi.getInfoBasic(this.sensorId, userId).subscribe((res: any) => {
                    this.infos = res;
                  });
                });
              });
            } else {
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }


  async maxPrompt(_value?: number) {
    const alert = await this.alertCtrl.create({
      header: '최대 범위값',
      inputs: [
        {
          name: 'value',
          type: 'number',
          value: _value,
          placeholder: '숫자입력'
        },
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel'
        },
        {
          text: '확인',
          role: 'submit',
          handler: data => {
            if(data.value != "") {
              this.storage.get(this.USER_ID).then(userId => {
                let value = { "user_id": userId, "sensor_id": this.sensorId, "value_max": data.value };
                this.postapi.updateMaxLimits(value).subscribe( (res: any) => {  
                  this.presentToast(res.success);
                  this.getapi.getInfoLimits(this.sensorId, userId).subscribe((res: any) => {
                    this.limit = res[0];
                  });
                });
              });              
            } else {
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async minPrompt(_value?: number) {
    const alert = await this.alertCtrl.create({
      header: '최소 범위값',
      inputs: [
        {
          name: 'value',
          type: 'number',
          value: _value,
          placeholder: '숫자입력'
        },
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel'
        },
        {
          text: '확인',
          role: 'submit',
          handler: data => {
            if(data.value != "") {
              this.storage.get(this.USER_ID).then(userId => {
                let value = { "user_id": userId, "sensor_id": this.sensorId, "value_min": data.value };
                this.postapi.updateMinLimits(value).subscribe( (res: any) => {  
                  this.presentToast(res.success);
                  this.getapi.getInfoLimits(this.sensorId, userId).subscribe((res: any) => {
                    this.limit = res[0];
                  });
                });
              });
            } else {
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }


  onChangeSchedule(event, num) {
    let value = {};
    switch (num) {
      case 1:
        value = {rep_term : event.target.value};
        break;
      case 2: 
        value = {cor_term : event.target.value};
        break;
      default: 
        document.write('해당 숫자가 없습니다.<br />');
        break;
    }

    this.postapi.updateSchedule(this.sensorId, value).subscribe((res: any) => {
      console.log(res);
    });

    console.log(event.target.value);
    console.log(num);
  }

}
