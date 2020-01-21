import { TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import { environment } from './../../../../environments/environment.prod';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, ActionSheetController, IonContent, LoadingController } from '@ionic/angular';

import * as moment from 'moment';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { GetApiService } from '../../../shared/services/get-api.service';
import { Storage } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SupportService } from '../../../shared/services/support-service';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import * as papa from 'papaparse';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss']
})
export class SendEmailComponent implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  COMPANY_ID = environment.company_id;
  USERNAME = environment.username;
  USERID = environment.user_id;

  MSG_OK = environment.msg_ok;
  MSG_NETWORK_ERROR = environment.msg_network_error;
  MSG_CORRECTION = environment.msg_correction;
  MSG_REPLACE = environment.msg_replace;
  MSG_TROUBLE = environment.msg_trouble;
  MSG_CLEAN = environment.msg_clean;
  MSG_RANGE_OFF = environment.msg_range_off;

  form: FormGroup;

  today : string;
  yesterday : string;
  sensors: any;
  email : string = "";

  isIndeterminate:boolean;
  masterCheck:boolean;
  sensor_ids = [];

  rows = [];
  csvHeaders: any;


  constructor(
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    public getapi: GetApiService,
    private storage: Storage,
    private file: File,
    private socialSharing: SocialSharing,
    private support: SupportService,
    public actionSheetController: ActionSheetController,
    public loadingController: LoadingController
  ) { 
    this.today = moment().format("YYYY-MM-DD");
    this.yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
    
    this.form =  this.formBuilder.group({
      start: [this.yesterday, [Validators.required]],
      end: [this.today, [Validators.required]],      
    });

  }

  ionViewDidEnter() {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getAllSensor(companyId).subscribe((res: any) => {
        this.sensors = res;
        res.forEach(element => element.isChecked = false);
      });
    });
    this.storage.get(this.USERNAME).then(username => {
      this.getapi.getProfile(username).subscribe((res) => {
        this.email = res[0].email;
      });
    });
    
  }
  
  ngOnInit() {
    this.support.presentLoading();
  }

  checkMaster() {
    setTimeout(()=>{
      this.sensors.forEach(obj => {
        obj.isChecked = this.masterCheck;
      });
    });
  }
 
  checkEvent(evt) {
    this.sensors.map(obj => {
      if(obj.id == evt.detail.value) {
        obj.isChecked = evt.detail.checked;
        if(evt.detail.checked == true) {
          this.sensor_ids.push(obj.id);
        } else if(evt.detail.checked == false) {
          const index = this.sensor_ids.indexOf(obj.id);
          if (index > -1) {
            this.sensor_ids.splice(index, 1);
          }
        }
      }
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: '더보기',
      buttons: [{
        text: '메일발송',
        icon: 'mail',
        handler: () => {
          this.openEmail();
        }
      },{
        text: '취소',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  inquery(order) {
    const startDate = this.form.controls['start'].value;
    const endDate = this.form.controls['end'].value;
    
    if (startDate > endDate) {
      this.support.showAlert("날짜설정이 잘못되었습니다.");
      return;
    }
    if(this.sensor_ids.length == 0) {
      this.support.showAlert("측정항목이 설정되지 않았습니다.");
      return;
    }

    let start = startDate.split("T", 1)[0];
    let end = endDate.split("T", 1)[0];

    if(order == 1) {
      this.storage.get(this.COMPANY_ID).then(companyId => {
        this.getapi.getDataList(companyId, this.sensor_ids, start, end).subscribe((res: any) => {
          this.rows = res;
          this.csvHeaders = Object.keys(res[0]);
          this.showAutoHideLoader();
        });
      });
    } else if(order == 2) {
      this.storage.get(this.COMPANY_ID).then(companyId => {
        this.storage.get(this.USERID).then(userId => {
          this.getapi.getEventList(companyId, userId, this.sensor_ids, start, end).subscribe((res: any) => {
            res.forEach(element => {
              if(element.state == null) {
                element.event = `${this.MSG_RANGE_OFF} (측정값): ${element.value}${element.unit}`;      
              } else if(element.value == null) {
                switch (element.state){
                  case "00" :
                    element.event = this.MSG_OK;
                    break;
                  case "02" :
                    element.event = this.MSG_NETWORK_ERROR;
                    break;
                  case "03" :
                    element.event = this.MSG_CORRECTION;
                    break;
                  case "04" :
                    element.event = this.MSG_REPLACE;
                    break;
                  case "06" :
                    element.event = this.MSG_TROUBLE;
                    break;
                  case "07" :
                    element.event = this.MSG_CLEAN;
                    break;
                  default :
                    console.log("State Wrong");
                }
              }
            });

            this.rows = res;
            this.csvHeaders = ['timestamp', 'name_tag', 'event', 'action'];
            this.showAutoHideLoader();

            console.log(res);

          });
        });
      });
    }

  }



  async openEmail() {
    let file = await this.resolveLocalFile();
    this.socialSharing.shareViaEmail(null, '수질계측자료', [this.email], null, null, file.nativeURL).then(() => {
      this.support.presentToast("메일이 발송되었습니다.");
      this.removeTempFile(file.name);
    }).catch((e) => {
      // Error!
    });
  }

  async resolveLocalFile() {
    /*
    let zipFile: JSZip = new JSZip();
    for(var i = 0; i < 3; i ++) {
      let fuck = this.file.writeFile(this.file.dataDirectory, csvname, csv, options);

      zipFile.file(`${i}`, fuck, {binary:true});
    }
    */

    let options: IWriteOptions = { replace: true };

    let csv = papa.unparse({
      fields: this.csvHeaders,
      data: this.rows,
    },{
      header: true,
    });
    let csvname = "";
    if(this.csvHeaders.length == 4) {
      csvname = `event_${this.today}.csv`;
    } else if (this.csvHeaders.length > 4) {
      csvname = `data_${this.today}.csv`;
    }

    return this.file.writeFile(this.file.dataDirectory, csvname, csv, options);
  }

  removeTempFile(name) {
    this.file.removeFile(this.file.dataDirectory, name);
  }


  showAutoHideLoader() {
    this.loadingController.create({
      message: '자료 준비중입니다.',
      duration: 2000
    }).then((res) => {
      res.present();
 
      res.onDidDismiss().then((dis) => {
        this.openEmail();
      });
    });
  }

}
