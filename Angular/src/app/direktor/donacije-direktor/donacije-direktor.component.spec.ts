import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonacijeDirektorComponent } from './donacije-direktor.component';

describe('DonacijeDirektorComponent', () => {
  let component: DonacijeDirektorComponent;
  let fixture: ComponentFixture<DonacijeDirektorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonacijeDirektorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonacijeDirektorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
