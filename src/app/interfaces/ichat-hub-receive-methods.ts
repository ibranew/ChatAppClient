import { Group } from "../models/group";

export interface IChatHubReceiveMethods {
  receiveLoginNotification(callback: (name: string) => void): void;
  receiveMessage(callback: (message: string,sender: string) => void): void;
  receiveMessageGroup(callback: (message: string,sender :string ,groupName: string) => void): void;
  receiveNotification(callback: (message: string,success:boolean) => void): void;
  receiveClients(callback: (clients: string[]) => void): void;
  receiveGroups(callback: (groups: Group[]) => void): void;
}
