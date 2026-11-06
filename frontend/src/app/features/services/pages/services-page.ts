import { Component } from '@angular/core';
import { Catalog } from '../../../shared/components/catalog/catalog';
@Component({
  selector: 'app-services-page',
  imports: [Catalog],
  template: `<app-catalog
    title="Dịch vụ tinh tuyển."
    description="Những nghi thức chăm sóc được thực hiện với sự tỉ mỉ và kỹ thuật chuẩn xác."
    [items]="items"
  />`,
})
export class ServicesPage {
  readonly items = [
    { index: '01', title: 'Classic Cut', text: 'Tư vấn và cắt tạo kiểu phù hợp khuôn mặt.' },
    {
      index: '02',
      title: 'Premium Fade',
      text: 'Chuyển tầng sắc nét bằng kỹ thuật fade hiện đại.',
    },
    { index: '03', title: 'Beard Ritual', text: 'Khăn nóng, cạo và tạo hình râu chuyên nghiệp.' },
  ];
}
