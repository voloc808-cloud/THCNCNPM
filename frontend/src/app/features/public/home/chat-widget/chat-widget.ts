import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat-widget',
  imports: [FormsModule, RouterLink],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget {
  @ViewChild('messageList') private messageList?: ElementRef<HTMLDivElement>;
  readonly open = signal(false);
  readonly messages = signal<Array<{ from: 'visitor' | 'assistant'; text: string }>>([
    { from: 'assistant', text: 'Xin chào! Bạn cần tìm dịch vụ, xem đội ngũ hay đặt lịch cắt tóc?' },
  ]);
  draft = '';

  toggle() {
    this.open.update((value) => !value);
  }

  send() {
    const question = this.draft.trim();
    if (!question) return;
    this.draft = '';
    const normalized = question.toLocaleLowerCase('vi-VN');
    let answer = 'Bạn có thể chọn nhanh Dịch vụ, Đội ngũ hoặc Đặt lịch bên dưới. Nếu cần hỗ trợ thêm, vui lòng liên hệ trực tiếp với quán.';
    if (/đặt lịch|lich hen|lịch hẹn|đặt chỗ|dat lich/.test(normalized)) {
      answer = 'Bạn chọn Đặt lịch bên dưới để xem dịch vụ, người thợ và khung giờ còn trống.';
    } else if (/dịch vụ|dich vu|giá|bao nhiêu|cắt tóc|cat toc/.test(normalized)) {
      answer = 'Bạn chọn Dịch vụ bên dưới để xem các dịch vụ và mức giá hiện tại.';
    } else if (/thợ|nhân viên|đội ngũ|stylist/.test(normalized)) {
      answer = 'Bạn chọn Đội ngũ bên dưới để xem thông tin những người thợ của quán.';
    }
    this.messages.update((items) => [...items, { from: 'visitor', text: question }, { from: 'assistant', text: answer }]);
    requestAnimationFrame(() => {
      const list = this.messageList?.nativeElement;
      if (list) list.scrollTop = list.scrollHeight;
    });
  }
}
