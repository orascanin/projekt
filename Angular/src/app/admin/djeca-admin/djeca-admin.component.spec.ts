import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DjecaAdminComponent } from './djeca-admin.component';

describe('DjecaAdminComponent', () => {
  let component: DjecaAdminComponent;
  let fixture: ComponentFixture<DjecaAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DjecaAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DjecaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
