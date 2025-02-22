import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from "./ui/chat/chat.component";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

 
}
