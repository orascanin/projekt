import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DjecaNjegovateljComponent } from './djeca-njegovatelj.component';

describe('DjecaNjegovateljComponent', () => {
  let component: DjecaNjegovateljComponent;
  let fixture: ComponentFixture<DjecaNjegovateljComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DjecaNjegovateljComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DjecaNjegovateljComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
