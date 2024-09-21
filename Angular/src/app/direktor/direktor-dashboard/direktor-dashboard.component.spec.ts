import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirektorDashboardComponent } from './direktor-dashboard.component';

describe('DirektorDashboardComponent', () => {
  let component: DirektorDashboardComponent;
  let fixture: ComponentFixture<DirektorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DirektorDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirektorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
