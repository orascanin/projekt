import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NjegovateljiDirektorComponent } from './njegovatelji-direktor.component';

describe('NjegovateljiDirektorComponent', () => {
  let component: NjegovateljiDirektorComponent;
  let fixture: ComponentFixture<NjegovateljiDirektorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NjegovateljiDirektorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NjegovateljiDirektorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
