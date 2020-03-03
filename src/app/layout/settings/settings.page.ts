import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { GetApiService } from '../../shared/services/get-api.service';
import { environment } from '../../../environments/environment.prod';
import { PostApiService } from '../../shared/services/post-api.service';
import { DatabaseService } from '../../shared/services/database.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  validations_form: FormGroup;

  USER_ID = environment.user_id;
  COMPANY_ID = environment.company_id;

  LOCKER = environment.locker;
  sensorId: string;
  infos: any;

  limits: any;
  schedules: any;

  stIntervals: Array<number> = [5, 10, 15, 20, 30, 60];
  selectNums: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  isEditItems: boolean = true;
  
  tableSets: Observable<any[]>;

  constructor(
    private getapi: GetApiService,
    public storage: Storage,
    public loadingController: LoadingController,
    public alertCtrl: AlertController,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private postapi: PostApiService,
    private toastController: ToastController,
    private db: DatabaseService

  ) { 
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');

  }

  ionViewWillEnter(){

    this.storage.ready().then(() => {

      this.storage.get(this.COMPANY_ID).then(companyId => {
        this.postapi.initSchedules(this.sensorId, companyId).subscribe();
      });

      this.storage.get(this.USER_ID).then(userId => {
        
        this.postapi.initLimits(userId, this.sensorId).subscribe();

        this.getapi.getInfoBasic(this.sensorId, userId).subscribe((res1: any) => {
          this.infos = res1;
          this.getapi.getInfoLimits(this.sensorId, userId).subscribe((res2: any) => {
            this.limits = res2;
            this.getapi.getInfoSchedule(this.sensorId).subscribe((res3: any) => {
              this.schedules = res3;
              this.validations_form = this.formBuilder.group({
                ch_id: new FormControl(res1[0].channel_id),
                ch_name: new FormControl(res1[0].ch_name),
                name_tag: new FormControl(res1[0].name_tag),

                value_max: new FormControl(res2[0].value_max),
                value_min: new FormControl(res2[0].value_min),

                rep_term: new FormControl(res3[0].rep_term, Validators.required),
                cor_term: new FormControl(res3[0].cor_term, Validators.required),
                check_term: new FormControl(res3[0].check_term, Validators.required)
                
              });
              
            });
          });

          /*
          let formList : any = {
            'ff': res1[0].ch_name,
            'ee': res1[0].name_tag,
          };
          */

        });
      });
    });
  }

  ngOnInit() {
    /*
    this.storage.get(this.USER_ID).then(userId => {
      this.db.addSettings(this.sensorId, userId).then(res => {
        alert(res);
      });
    });
    */

   this.presentLoading();

    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.tableSets = this.db.getSettings();
        console.log(this.tableSets);
      }

    });
  }

  onSubmit(value){
    let data = {
      ch_id: value.ch_id,
      ch_name: value.ch_name,
      name_tag: value.name_tag,
      value_max: value.value_max,
      value_min: value.value_min,
      rep_term: value.rep_term,
      cor_term: value.cor_term,
      check_term: value.check_term
    }
    this.storage.get(this.USER_ID).then(userId => {
      this.postapi.updateSettings(userId, this.sensorId, data)
      .subscribe(
        res => {
          this.presentToast('변경되었습니다.');
          this.router.navigate(["/home"]);
        }
      );
    }); 
  }

  maxChanged(evt) {
    this.storage.get(this.USER_ID).then(userId => {
      let value = {sensor_id: this.sensorId, position: "max", user_id: userId, bool: evt.target.value};
      this.postapi.booleanLimits(value).subscribe(res => {
        this.presentToast('최대알림이 변경되었습니다.');
      });
    });
  }

  minChanged(evt) {
    this.storage.get(this.USER_ID).then(userId => {
      let value = {sensor_id: this.sensorId, user_id: userId, position: "min", bool: evt.target.value};
      this.postapi.booleanLimits(value).subscribe(res => {
        this.presentToast('최소알림이 변경되었습니다.');
      });
    });

  }

  tempBoolChanged(evt) {
    this.storage.get(this.USER_ID).then(userId => {
      let value = {sensor_id: this.sensorId, user_id: userId, type: "bool", value: evt.target.value};
      this.postapi.tempLimits(value).subscribe(res => {
        this.presentToast('온도표시가 변경되었습니다.');
      });
    });
  }

  tempUnitChanged(evt) {
    this.storage.get(this.USER_ID).then(userId => {
      let value = {sensor_id: this.sensorId, user_id: userId, type: "unit", value: evt.target.value};
      this.postapi.tempLimits(value).subscribe(res => {
        this.presentToast('온도단위가 변경되었습니다.');
      });
    });
  }

  intervalChanged(evt) {
    this.storage.get(this.USER_ID).then(userId => {
      let value = {sensor_id: this.sensorId, user_id: userId, value: evt.target.value};
      this.postapi.intervalLimits(value).subscribe(res => {
        this.presentToast('시간간격이 변경되었습니다.');
      });
    });
  }
  

  async presentToast(msg) {
    const toast = await this.toastController.create({
        message: msg,
        position: 'bottom',
        duration: 2500
    });
    toast.present();
  }


  verifyPass(num) {
    let alert = this.alertCtrl.create({
      header: '암호 입력',
      //message: '암호 입력',
      inputs: [
        {
          type: 'password',
          name: 'pass',
          placeholder: '비밀번호'
        },
      ],
      buttons: [{
        text: '취소',
        role: 'cancel',
      },{
          text: '확인',
          role: 'submit',
          handler: (data) => {
            
            if(data.pass != this.LOCKER) {
              this.wrongAlert('암호가 일치하지 않습니다.');
            } else {
              switch (num) {
                case 0:
                  this.onSubmit(this.validations_form.value);
                  break;
                case 1:
                  this.wrongAlert('개발중입니다.');
                  break;
                case 2:
                  this.wrongAlert('개발중입니다.');
                  break;
              }
            }
          
          }
        }]
    });
    alert.then(alert => alert.present());
  }

  wrongAlert(msg) {
    let alert = this.alertCtrl.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }


  onEditCloseItems() {
    this.isEditItems = !this.isEditItems;
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 1000,
      spinner: 'bubbles',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

}
