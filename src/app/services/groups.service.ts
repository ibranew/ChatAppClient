import { inject, Injectable, OnInit } from '@angular/core';
import { Group } from '../models/group';
import { ChatSignalRService } from './chat-signal-r.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private _groups: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);

  constructor(private signalRService: ChatSignalRService){
    this.signalRService.receiveGroups(groups => {
      this._groups.next(groups)
    });
  }

  addGroup(groupName: string) {
    this.signalRService.addGroup(groupName);
  }

  joinGroup(name: string) {
    this.signalRService.joinGroup(name);
  }

  isMember(selectedGroup: Group | null, userName: string): boolean {

    debugger;
    if(!selectedGroup)
      return false;

    const isMember = selectedGroup?.memberNames.includes(userName);
    return isMember ? true : false;
  }

  get Groups(): Observable<Group[]> {
    return this._groups.asObservable();
  }
}
