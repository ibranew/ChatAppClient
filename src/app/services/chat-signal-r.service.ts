import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Group } from '../models/group';
import { ReceiveHubMethods } from '../enums/receive-hub-methods';
import { HubMethods } from '../enums/hub-methods';
import { IChatHubMethods } from '../interfaces/ichat-hub-methods';
import { IChatHubReceiveMethods } from '../interfaces/ichat-hub-receive-methods';


@Injectable({
  providedIn: 'root'
})
export class ChatSignalRService implements IChatHubMethods,IChatHubReceiveMethods{
  private hubConnection!: signalR.HubConnection;
  
  constructor() {
    this.startConnection();
  }

  private startConnection() {
    const url : string = "https://localhost:7145/chat-hub";
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Chat SignalR bağlantısı kuruldu'))
      .catch((err) => setTimeout(() => {
        this.startConnection();
      }, 2000));

  }
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
  

  //Methods
  addClient(name: string){
    this.hubConnection.invoke(HubMethods.AddClient,name).catch((err) => console.error(err));
  }
  leaveClient() {
    this.hubConnection.invoke(HubMethods.LeaveClient).catch((err) => console.error(err));
  }
  addGroup(groupName: string){
    this.hubConnection.invoke(HubMethods.AddGroup,groupName).catch((err) => console.error(err));
  }
  joinGroup(groupId: string) {
    this.hubConnection.invoke(HubMethods.JoinGroup,groupId).catch((err) => console.error(err));
  }
  
  sendMessage(message: string, clientName: string){
    this.hubConnection.invoke(HubMethods.SendMessage,message,clientName).catch((err) => console.error(err));
  }

  sendMessageToGroup(message: string, groupId: string){
    this.hubConnection.invoke(HubMethods.SendMessageToGroup,message,groupId).catch((err) => console.error(err));
  }

  //Receive Hub Methods

  receiveLoginNotification(callback: (name: string) => void){
    this.hubConnection.on(ReceiveHubMethods.ReceiveLoginNotification, callback);
  }

  receiveClients(callback: (clients: string[]) => void) {
    this.hubConnection.on(ReceiveHubMethods.ReceiveClients, callback);
  }
  receiveGroups(callback: (groups: Group[]) => void) {
    this.hubConnection.on(ReceiveHubMethods.ReceiveGroups, callback);
  }
  receiveMessage(callback: (message: string,sender :string) => void){
    this.hubConnection.on(ReceiveHubMethods.ReceiveMessage, callback);
  }
  receiveMessageGroup(callback: (message: string,sender :string ,groupName: string) => void){
    this.hubConnection.on(ReceiveHubMethods.ReceiveMessageGroup, callback);
  }
  receiveNotification(callback: (message: string,success:boolean) => void){
    this.hubConnection.on(ReceiveHubMethods.ReceiveNotification, callback);
  }

}
