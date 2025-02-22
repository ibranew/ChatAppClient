import { inject, Injectable, OnInit } from '@angular/core';
import { ChatSignalRService } from './chat-signal-r.service';
import { Group } from '../models/group';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private _UserName : BehaviorSubject<string> = new BehaviorSubject<string>("");//User
  
  private _clients: string[] = [];
  
  private _ClientShown: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
 
  constructor(private signalRService : ChatSignalRService) {
    this.initSignalRHandlers();
    this._UserName.subscribe(username => { 
      if (!this._clients?.includes(username) && username !== '') { 
        this._UserName.next('');
      }
    });
    
  }

  //gruptaki değişiklikleri dinliyoruz
  private initSignalRHandlers() {
    this.signalRService.receiveClients((clients) => {
      this._clients = clients; 
      this._ClientShown.next(clients);

    });
  }

  

  addClient(name : string){
    if(!this.signalRService.isConnected()){
      return;
    }
    debugger;
    this.signalRService.addClient(name);
    this.signalRService.receiveLoginNotification((name)=> this._UserName.next(name))
  }
  leaveClient(){
    this.signalRService.leaveClient();
    this._UserName.next('');
  }

  getClientShown(selectedGroup: Group | null): Observable<string[]> {
    if (!selectedGroup) {
      this._ClientShown.next(this._clients);
    } else {
      const clients = this._clients.filter(client => selectedGroup?.memberNames.includes(client));
      this._ClientShown.next(clients);
    }
    return this._ClientShown.asObservable();
  }
  getUserName(): Observable<string> {
    return this._UserName.asObservable();
  }
}
