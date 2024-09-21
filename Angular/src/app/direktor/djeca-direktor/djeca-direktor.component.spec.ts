import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DjecaDirektorComponent } from './djeca-direktor.component';

describe('DjecaDirektorComponent', () => {
  let component: DjecaDirektorComponent;
  let fixture: ComponentFixture<DjecaDirektorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DjecaDirektorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DjecaDirektorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
