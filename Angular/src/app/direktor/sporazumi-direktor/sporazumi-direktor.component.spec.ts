import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SporazumiDirektorComponent } from './sporazumi-direktor.component';

describe('SporazumiDirektorComponent', () => {
  let component: SporazumiDirektorComponent;
  let fixture: ComponentFixture<SporazumiDirektorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SporazumiDirektorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SporazumiDirektorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
