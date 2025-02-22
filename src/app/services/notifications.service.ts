import { Injectable } from '@angular/core';
import { ChatSignalRService } from './chat-signal-r.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private notificationText: BehaviorSubject<string> = new BehaviorSubject<string>("");
  
  constructor(private signalRService: ChatSignalRService){
    signalRService.receiveNotification((message)=>{
       this.notificationText.next(message);
     });
  }
  
  getNotificationText() : Observable<string>{
    return this.notificationText.asObservable();
  }

}
