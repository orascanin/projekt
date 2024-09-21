import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MojeDonacijeComponent } from './moje-donacije.component';

describe('MojeDonacijeComponent', () => {
  let component: MojeDonacijeComponent;
  let fixture: ComponentFixture<MojeDonacijeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MojeDonacijeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MojeDonacijeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
