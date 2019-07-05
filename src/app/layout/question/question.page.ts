import { MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
})
export class QuestionPage implements OnInit {

  information: any[];
  automaticClose = false;


  constructor(
    private http: HttpClient,
    public menu: MenuController,
    ) {
    this.http.get('assets/data/question.json').subscribe(res => {
      this.information = res['items'];
      /*
      this.information
      .map(item => console.log(item.description))
      */
    });
  }


  ngOnInit() {

  }


  toggleSection(index) {
    this.information[index].open = !this.information[index].open;

    if (this.automaticClose && this.information[index].open) {
      this.information
      .filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
  }

}
