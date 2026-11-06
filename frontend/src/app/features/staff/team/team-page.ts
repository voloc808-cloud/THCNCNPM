import { Component, OnInit, inject, signal } from '@angular/core';
import { Catalog, CatalogItem } from '../../../shared/components/catalog/catalog';
import { CustomerApiService } from '../../customer/services/customer-api.service';

@Component({
  selector: 'app-team-page',
  imports: [Catalog],
  template: `<app-catalog
    title="Những người thợ."
    description="Kinh nghiệm, gu thẩm mỹ và sự tận tâm đứng sau mỗi diện mạo chỉn chu."
    [items]="items()"
  />`,
})
export class TeamPage implements OnInit {
  private readonly api = inject(CustomerApiService);

  readonly items = signal<CatalogItem[]>([
    { index: '01', title: 'Hoàng Minh', text: 'Chuyên fade và phong cách cổ điển.' },
    { index: '02', title: 'Anh Khoa', text: 'Tạo kiểu hiện đại và chăm sóc râu.' },
    { index: '03', title: 'Royal Standard', text: 'Đội ngũ tuân thủ tiêu chuẩn dịch vụ Royal.' },
  ]);

  ngOnInit() {
    this.api.getStaff().subscribe({
      next: (response) => {
        const staff = response.data.items.map((member, index) => ({
          index: String(index + 1).padStart(2, '0'),
          title: member.user.fullName,
          text: member.specialties || `${member.yearsOfExperience} năm kinh nghiệm tại Royal Barber.`,
          imageUrl: member.user.avatarUrl,
        }));
        if (staff.length) this.items.set(staff);
      },
      error: () => undefined,
    });
  }
}