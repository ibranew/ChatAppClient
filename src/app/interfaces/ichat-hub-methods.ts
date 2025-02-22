export interface IChatHubMethods {
    addClient(name: string): void;
    leaveClient():void;
    addGroup(groupName: string): void;
    joinGroup(groupId: string): void;
    sendMessage(message: string, clientName: string): void;//SendMessageToGroup
    sendMessageToGroup(message: string, groupId: string): void;
  }
