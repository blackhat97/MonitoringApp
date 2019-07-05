import { Storage } from '@ionic/storage';
import { environment } from './../../../../../environments/environment.prod';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

/** echarts extensions: */
import 'echarts/theme/macarons.js';
import 'echarts/dist/extension/bmap.min.js';

import * as moment from 'moment';
import { GetApiService } from '../../../../shared/services/get-api.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {

  USER_ID = environment.user_id;

  timestamp : any = [];
  value : any = [];
  value_temp : any = [];
  sensorId : string;
  tableName : string;

  today : string;
  yesterday : string;

  updateOption: any;
  updateOptionTemp: any;

  chartForm: FormGroup;
  
  optionValue = {
    color: ['#80ccff'],
    title: [{
      left: 'center',
      //text: '용존산소량'
    }],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
          type: 'line',
          crossStyle: {
              color: '#999'
          }
      }
    },
    dataZoom: [
      {
          show: true,
          realtime: true,
          start: 30,
          end: 70,
      }
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap : false,
        scale: true,
        data: this.timestamp,
      }
    ],
    yAxis: [
      {
        type: 'value',
        //name: 'mg/L',
        splitArea: {
          show: true
        },
      }
    ],
    series: [
      {
        //name: 'DO',
        type: 'line',
        barWidth: '60%',
        symbol: 'none',
        //smooth:true,
        //symbolSize: 5,
        data: this.value,
        markPoint: {
          data: [
              {type: 'max', name: '최고점'},
              {type: 'min', name: '최저점'}
          ]
        },
      }
    ]
  };

  optionTemp = {
    color: ['#33ff33'],
    title: [{
      left: 'center',
      text: '온도'
    }],
    tooltip: {
      trigger: 'axis'
    },
    dataZoom: [
      {
          show: true,
          realtime: true,
          start: 30,
          end: 70,
      }
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap : false,
        scale: true,
        data: this.timestamp,
      }
    ],
    yAxis: [
      {
        name: '°C',
        type: 'value',
        splitArea: {
          show: true
        },
      }
    ],
    series: [
      {
        name: 'Temp',
        type: 'line',
        symbol: 'none',
        barWidth: '60%',
        data: this.value_temp,    
        markPoint: {
          data: [
              {type: 'max', name: '최고점'},
              {type: 'min', name: '최저점'}
          ]
        },
      }
    ]
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private getapi: GetApiService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private storage: Storage,
    public loadingController: LoadingController,

  ) {
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');
    
    this.today = moment().format("YYYY-MM-DD");
    this.yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
    
    this.chartForm =  this.formBuilder.group({
      start: [this.yesterday, [Validators.required]],
      end: [this.today, [Validators.required]],
    });

    
  }
  
  ngOnInit() {

    this.getChart(this.sensorId , this.today, this.yesterday);

    this.storage.ready().then(() => {
      this.storage.get(this.USER_ID).then(userId => {
        
        this.getapi.getInfoBasic(this.sensorId, userId).subscribe((info: any) => {
          this.getapi.getInfoLimits(this.sensorId, userId).subscribe((limits: any) => {
            
            let rArray = [];
            if(limits[0].bool_max) {
              rArray.push({name: '최대', type:'max', yAxis: limits[0].value_max, itemStyle:{normal:{color:'#8B4513'}}});
            }
            if(limits[0].bool_min) {
              rArray.push({name: '최소', type:'min', yAxis: limits[0].value_min, itemStyle:{normal:{color:'#8B4513'}}});
            }
            
            this.updateOption = {
              title: [{
                text: info[0].type
              }],
              yAxis: [{
                  name: info[0].unit
              }],
              series: [{
                name: info[0].type,
                markLine: {
                  symbol: ['none'],
                  data: rArray,
                }
              }]
            };
          });
        });

      });
    });

  }

  getChart(sensorId, today, yesterday) {

    this.storage.get(this.USER_ID).then(userId => {
      this.getapi.getChart(sensorId, userId, today, yesterday).subscribe((data: any) => {

        
        for(let i=0; i<data.length; i++) {
          let dateString = moment.unix(data[i].timestamp).format("MM/DD HH:mm");
          this.timestamp.push(dateString);
          this.value.push(data[i].value);
          this.value_temp.push(data[i].temp);
        }
      });
    });

  }

  onSubmit() {

    const startDate = this.chartForm.controls['start'].value;
    const endDate = this.chartForm.controls['end'].value;
    
    if (startDate > endDate) {
      this.showAlert("날짜설정이 잘못되었습니다.");
      return;
    }

    let start = startDate.split("T", 1)[0];
    let end = endDate.split("T", 1)[0];

    this.getapi.updateChart(this.sensorId, start, end)
    .subscribe((data: any) => {
      if(data[0] == null) {
        this.showAlert("데이터가 존재하지 않습니다.");
        return;
      } else {

        this.presentLoading();

        this.timestamp = [];
        this.value = [];
        this.value_temp = [];
        
        for(let i=0; i<data.length; i++) {        
          let dateString = moment.unix(data[i].timestamp).format("MM/DD HH:mm");
          this.timestamp.push(dateString);
          this.value.push(data[i].value);
          this.value_temp.push(data[i].temp);
          
        }
        this.updateOption = {
          series: [{
            data: this.value
          }],
          xAxis: [
          {
            data: this.timestamp
          }]
        };

        this.updateOptionTemp = {
          series: [{
            data: this.value_temp
          }],
          xAxis: [
          {
            data: this.timestamp
          }]
        };


      }
    });


  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 500,
      spinner: 'bubbles',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

  

}
