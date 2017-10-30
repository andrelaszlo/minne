import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/groupBy'
import * as moment from 'moment-timezone';

@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {

  public items: Observable<any>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider
  ) {
    this.items = firebaseProvider.getSortedItems().map(items => {
      var lastGroup = null;
      var result = [];
      var temp = [];
      for (let item of items) {
        var group = this.getDayName(item);
        if (lastGroup == null) {
          lastGroup = group;
        } else if (group != lastGroup) {
          if (temp.length) {
            result.push({'key': lastGroup, 'items': temp});
            temp = [item];
          }
          lastGroup = group;
        } else {
          temp.push(item);
        }
      }
      if (temp.length) {
        result.push({'key': lastGroup, 'items': temp});
      }
      return result;
    });
  }

  getTime(value: Date) {
    return moment(value).format('HH:mm');
  }

  private getDayName(note) {
    return moment(note.date).format('dddd, MMM D');
  }

}
