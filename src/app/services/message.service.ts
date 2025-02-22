// chat.service.ts
import { inject, Injectable, OnInit } from '@angular/core';
import { ChatSignalRService } from './chat-signal-r.service';
import { Group } from '../models/group';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/message';



@Injectable({ providedIn: 'root' })
export class MessageService {
  private _Client: string = "Sen"; // User

  private _messages: Record<string, Message[]> = {};
  private _unreadCounts: BehaviorSubject<Record<string, number>> = new BehaviorSubject<Record<string, number>>({});
  private _selectedMessageBox: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

  private _selectedConversationId: string = '';
  private _selectedConversationName: string = '';
  private _selectedConversationIsGroup: boolean = false;

  constructor(private signalRService: ChatSignalRService) {
    this.initSignalRHandlers();
  }

  // Gelen mesajları dinle
  private initSignalRHandlers() {
    this.signalRService.receiveMessage((message, sender) => {
      this.handleNewMessage(sender, message);
    });

    this.signalRService.receiveMessageGroup((message, sender, groupId) => {
      this.handleNewGroupMessage(message, sender, groupId);
      console.log("message-group");
    });
  }

  // Mesaj ekleme
  private addMessage(conversationId: string, text: string, sender: string, isGroup: boolean) {
    if (!this._messages[conversationId]) {
      this._messages[conversationId] = [];
    }
    this._messages[conversationId].push({ sender, text });

    const isActiveChat = this.selectedConversationId === conversationId;

    if (!isActiveChat) {
      const updatedCounts = { ...this._unreadCounts.value, [conversationId]: (this._unreadCounts.value[conversationId] || 0) + 1 };
      this._unreadCounts.next(updatedCounts);
    }

    // Seçili mesaj ise doğrudan yay
    if (this.selectedConversationId === conversationId) {
      this._selectedMessageBox.next([...this._messages[conversationId] || []]);
    }
  }

  // Client'a mesaj gönderme
  private handleNewMessage(sender: string, message: string) {
    this.addMessage(sender, message, sender, false);
  }

  // Grup'a mesaj gönderme
  private handleNewGroupMessage(message: string, sender: string, groupId: string) {
    this.addMessage(groupId, message, sender, true);
  }

  // Genel mesaj gönderme
  sendMessage(text: string) {
    if (!text.trim()) return; // Boş mesaj göndermeyi engelle
    if (this._selectedConversationIsGroup) {
      this.signalRService.sendMessageToGroup(text, this.selectedConversationId);
    } else {
      this.signalRService.sendMessage(text, this.selectedConversationId);
    }
    // Senin gönderdiğin mesajı ekle
    this.addMessage(this.selectedConversationId, text, this._Client, this._selectedConversationIsGroup);
  }

  getMessages(): Observable<Message[]> {
    return this._selectedMessageBox.asObservable();
  }

  getUnreadCounts(): Observable<Record<string, number>> {
    return this._unreadCounts.asObservable();
  }

  resetUnreadCount(conversationId: string) {
    const isActiveChat = this.selectedConversationId === conversationId;
    if (isActiveChat) {
      const updatedCounts = { ...this._unreadCounts.value, [conversationId]: 0 };
      this._unreadCounts.next(updatedCounts);
    }
  }

  setSelectedClient(clientName: string) {
    this._selectedConversationId = clientName;
    this._selectedConversationName = clientName;
    this._selectedConversationIsGroup = false;
    this.resetUnreadCount(clientName);
    this._selectedMessageBox.next([...this._messages[clientName] || []]);
  }

  setSelectedGroup(group: Group) {
    this._selectedConversationId = group.id;
    this._selectedConversationName = group.name;
    this._selectedConversationIsGroup = true;
    this.resetUnreadCount(group.id);
    this._selectedMessageBox.next([...this._messages[group.id] || []]);
  }
  
  get selectedConversationId(): string {
    return this._selectedConversationId;
  }
}
