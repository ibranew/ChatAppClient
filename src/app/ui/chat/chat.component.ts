import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Group } from '../../models/group';
import { MessageService } from '../../services/message.service';
import { GroupsService } from '../../services/groups.service';
import { ClientsService } from '../../services/clients.service';
import { NotificationsService } from '../../services/notifications.service';
import { Message } from '../../models/message';


enum NotificationType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info'
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit{
  
  //servisler
  messagesService : MessageService = inject(MessageService);
  groupsService : GroupsService = inject(GroupsService);
  clientsService : ClientsService = inject(ClientsService);
  notificationsService : NotificationsService = inject(NotificationsService);

  //bildirim
  notificationMessage = "";
  notificationType : NotificationType | null = null;
  
  //user
  userName = "";

  //chat-section
  messages: Message[] = []; //current messages
  conversationLabel = ""; //chat header
  newMessage = ""

  //group
  groups : Group[] = [];
  selectedGroup : Group | null = null;
  addGroupName : string = "";

  //clients
  clients : string[] = [];
  selectedClientName = "";

  //unread
  _unreadCounts : Record<string, number> = {};
  

  ngOnInit() {
    
    this.groupsService.Groups.subscribe((groups : Group[]) => { this.groups = groups; });
    this.clientsService.getUserName().subscribe(name => {
      this.userName = name;
      if(this.userName)
        this.showNotification("Hoş geldiniz",NotificationType.SUCCESS); 
    });
    //seçili mesajları al
    this.messagesService.getMessages().subscribe(messages=> this.messages = messages);
    this.messagesService.getUnreadCounts().subscribe((unreadCounts)=> this._unreadCounts = unreadCounts);
    this.notificationsService.getNotificationText().subscribe((text)=>
    {
      this.showNotification(text,NotificationType.SUCCESS)
    })
  }

  sendMessage() {
    this.messagesService.sendMessage(this.newMessage);
    this.newMessage = "";
  }
  async addUser(clientName: string) {
    this.clientsService.addClient(clientName);
  }
  leaveUser() {
    this.clientsService.leaveClient();
    this.userName = "";
  }
  joinGroup() {
    if(this.groupsService.isMember(this.selectedGroup,this.userName))
      this.showNotification("Zaten üyesiniz",NotificationType.INFO);
    else
    this.groupsService.joinGroup(this.selectedGroup?.id??"")
  }
  addGroup() {
    this.groupsService.addGroup(this.addGroupName);
    this.addGroupName = "";
  }
  onClientSelect(client: string) {
    if(client === this.userName)
      return;
    this.messagesService.setSelectedClient(client);
    this.conversationLabel = client;
    this.selectedGroup = null;
  }
  onRoomSelect(group: Group) {
    this.messagesService.setSelectedGroup(group);
    this.conversationLabel = group.name;
    this.clientsService.getClientShown(group).subscribe((clients: string[]) => {
      this.clients = clients;
    });
  }
  showNotification(message: string, type: NotificationType, duration: number = 3000) {
    this.notificationMessage = message;
    this.notificationType = type;
    // Belirtilen süre sonunda bildirimi sıfırla
    setTimeout(() => {
      this.notificationMessage = "";
      this.notificationType = null;
    }, duration);
  }

  get notifyClass() {
    return ['notify-bar', this.notificationType || 'default'];
  }
  get isSendDisabled() {
    return !this.messagesService.selectedConversationId || !this.userName || !this.newMessage.trim();
  }
  get membersLabel() {
    return "Kullanıcılar";
  }
  get notificationText() {
    return this.notificationMessage || (this.userName ? `Kullanıcı adınız: ${this.userName}` : "Hoş geldiniz");
  }

}
