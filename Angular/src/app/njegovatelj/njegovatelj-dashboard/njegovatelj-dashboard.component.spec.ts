import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NjegovateljDashboardComponent } from './njegovatelj-dashboard.component';

describe('NjegovateljDashboardComponent', () => {
  let component: NjegovateljDashboardComponent;
  let fixture: ComponentFixture<NjegovateljDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NjegovateljDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NjegovateljDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
