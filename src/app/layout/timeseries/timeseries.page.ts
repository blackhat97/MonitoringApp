import { GetApiService } from './../../shared/services/get-api.service';
import { DatepickerI18nKoreanService } from './../../shared/services/datepicker-i18n-korean.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { TableColumn } from '@swimlane/ngx-datatable';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import * as papa from 'papaparse';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { ToastController, AlertController, ActionSheetController, Platform, LoadingController } from '@ionic/angular';
import { environment } from '../../../environments/environment.prod';
import { Angular2CsvComponent } from 'angular2-csv';

@Component({
  selector: 'app-timeseries',
  templateUrl: './timeseries.page.html',
  styleUrls: ['./timeseries.page.scss'],
  providers: [
    {provide: NgbDatepickerI18n, useClass: DatepickerI18nKoreanService}
  ]
})
export class TimeseriesPage implements OnInit {

  @ViewChild(Angular2CsvComponent) csvComponent: Angular2CsvComponent;

  COMPANY_ID = environment.company_id;
  USER_ID = environment.user_id;

  rows = [];
  sensors: any;

  loggerForm: FormGroup;
  intervals = [5, 10, 15, 20, 30, 60];
  table_messages = {
    'emptyMessage': '데이터가 없습니다.',
    'totalMessage': ''
  };

  columns = [
    { name: '날짜시간', prop: 'timestamp'},
    { name: '단위', prop: 'unit'},
    { name: '값', prop: 'value'},
    { name: '온도', prop: 'temp'},
  ];

  csvHeaders = 
  this.columns.map((column: TableColumn) => column.prop)
  .filter((e) => e);

  csvOptions = {
    fieldSeparator  : ',',
    quoteStrings    : '"',
    decimalseparator: '.',
    showLabels      : true,
    headers         : this.csvHeaders,
    showTitle       : false,
    title           : 'Report',
    useBom          : true
  }

  constructor(
    private getapi: GetApiService,
    private storage: Storage,
    private formBuilder: FormBuilder,
    private socialSharing: SocialSharing,
    private file: File,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    public actionSheetController: ActionSheetController,
    private transfer: FileTransfer,
    private platform: Platform,
    public loadingController: LoadingController,

  ) {
    storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getAllSensor(companyId).subscribe((res: any)=> {
        this.sensors = res;
      });
    });

  }

  ngOnInit() {

    this.loggerForm =  this.formBuilder.group({
      sensor_id: ['', [Validators.required]],
      start: ['', [Validators.required]],
      end: ['', [Validators.required]],
      interval: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loggerForm.invalid) {
      return;
    }

    this.presentLoading();

    const sensorId = this.loggerForm.controls['sensor_id'].value;
    const interval = this.loggerForm.controls['interval'].value;
    const startDate = this.loggerForm.controls['start'].value;
    const endDate = this.loggerForm.controls['end'].value;
    
    if (startDate > endDate) {
      this.showAlert("날짜설정이 잘못되었습니다.");
      return;
    }

    let start = startDate.split("T", 1)[0];
    let end = endDate.split("T", 1)[0];

    this.storage.get(this.USER_ID).then(userId => {
      this.getapi.getTimeseries(sensorId, userId, interval, start, end)
      .subscribe((res: any) => {
        this.rows = res;
      });
    });
    
  }

  getRowClass(row) {
    let limitsBool: boolean;
    if(row.bool_max && row.bool_min) {
      limitsBool = row.value > row.value_max || row.value < row.value_min;
    } else if(row.bool_max) {
      limitsBool = row.value > row.value_max;
    } else if(row.bool_min) {
      limitsBool = row.value < row.value_min;
    }
    return {
      'age-is-ten': limitsBool
    };
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 500,
      message: '로딩중...',
      spinner: 'bubbles',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

  async shareCsv() {
    let file = await this.resolveLocalFile();

    this.socialSharing.share("Share message", "Share subject", file.nativeURL, "A URL to share").then(() => {
      this.removeTempFile(file.name);
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    });
  }

  async shareEmail() {
    let file = await this.resolveLocalFile();

    this.socialSharing.shareViaEmail(null, '수질계측자료', null, null, null, file.nativeURL).then(() => {
      this.removeTempFile(file.name);
    }).catch((e) => {
      // Error!
    });
  }

  downloadCsv() {
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }
  

  async download() {
    const fileTransfer: FileTransferObject = this.transfer.create();
    let path = null;

    if(this.platform.is('ios')) {
      path = this.file.documentsDirectory;
    } else {
      path = this.file.dataDirectory;
    }
        //let path = this.file.externalRootDirectory + '/Download/'; // for Android

    let csv = papa.unparse({
      fields: this.csvHeaders,
      data: this.rows
    });

    let url = 'https://www.stats.govt.nz/assets/Uploads/Annual-enterprise-survey/Annual-enterprise-survey-2017-financial-year-provisional/Download-data/annual-enterprise-survey-2017-financial-year-provisional-csv.csv';

    fileTransfer.download(url, path + 'data.csv', true).then((entry) => {
      this.showAlert(entry.toURL());
    }, (error) => {
      this.showAlert(JSON.stringify(error));
    });
    
  }

  async resolveLocalFile() {
    let options: IWriteOptions = { replace: true };
    let csv = papa.unparse({
      fields: this.csvHeaders,
      data: this.rows
    });
    return this.file.writeFile(this.file.dataDirectory, "data.csv", csv, options);
    //return this.file.copyFile(`${this.file.applicationDirectory}www/assets/img/`, 'arrow.png', this.file.cacheDirectory, `arrow.png`);
  }

  removeTempFile(name) {
    this.file.removeFile(this.file.dataDirectory, name);
    //this.file.removeFile(this.file.cacheDirectory, name);
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
        message: text,
        position: 'bottom',
        duration: 2500
    });
    toast.present();
  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: '더보기',
      buttons: [{
        text: '다운로드',
        icon: 'download',
        handler: () => {
          this.downloadCsv();
        }
      },{
        text: '메일',
        icon: 'mail',
        handler: () => {
          this.shareEmail();        
        }
      }]
    });
    await actionSheet.present();
  }

}
