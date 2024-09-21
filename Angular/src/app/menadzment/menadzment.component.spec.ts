import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenadzmentComponent } from './menadzment.component';

describe('MenadzmentComponent', () => {
  let component: MenadzmentComponent;
  let fixture: ComponentFixture<MenadzmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenadzmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenadzmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
