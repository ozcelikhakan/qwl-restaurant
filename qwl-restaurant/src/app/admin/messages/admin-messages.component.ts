import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ContactService } from '../../core/services/contact.service';
import { ContactMessageDto } from '../../core/models/contact.models';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

// Maps contact message DTO data to the local message model
function mapDto(m: ContactMessageDto): Message {
  return {
    id:      m.id,
    name:    m.fullName,
    email:   m.email,
    subject: m.subject,
    body:    m.message,
    date:    m.createdAt.substring(0, 10),
    read:    m.isRead,
  };
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-messages.component.html',
})
export class AdminMessagesComponent implements OnInit {
  // Inject contact service to load and manage contact messages
  private svc = inject(ContactService);

  // Message page state
  messages   = signal<Message[]>([]);
  loading    = signal(true);
  error      = signal('');
  selected   = signal<Message | null>(null);
  search     = signal('');
  onlyUnread = signal(false);

  // Filters messages by unread status, sender name, or subject
  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.messages().filter(m =>
      (!this.onlyUnread() || !m.read) &&
      (!q || m.name.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q))
    );
  });

  // Calculates unread message count
  unreadCount = computed(() => this.messages().filter(m => !m.read).length);

  // Loads all contact messages when the component is initialized
  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: list => {
        this.messages.set(list.map(mapDto));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Messages could not be loaded.');
        this.loading.set(false);
      }
    });
  }

  // Selects a message and marks it as read if it is unread
  select(msg: Message): void {
    this.selected.set(msg);
    if (!msg.read) this.markRead(msg.id);
  }

  // Marks a message as read
  markRead(id: number): void {
    this.svc.markAsRead(id).subscribe({
      next: () => {
        this.messages.update(list => list.map(m => m.id === id ? { ...m, read: true } : m));
        if (this.selected()?.id === id) this.selected.update(m => m ? { ...m, read: true } : m);
      }
    });
  }

  // Deletes a message
  delete(id: number): void {
    this.svc.delete(id).subscribe({
      next: () => {
        this.messages.update(list => list.filter(m => m.id !== id));
        if (this.selected()?.id === id) this.selected.set(null);
      }
    });
  }
}