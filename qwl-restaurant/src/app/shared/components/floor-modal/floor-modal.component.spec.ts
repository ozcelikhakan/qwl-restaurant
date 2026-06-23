import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorModalComponent } from './floor-modal.component';

describe('FloorModalComponent', () => {
  let component: FloorModalComponent;
  let fixture: ComponentFixture<FloorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
