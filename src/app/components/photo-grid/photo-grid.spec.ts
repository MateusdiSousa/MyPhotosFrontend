import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGrid } from './photo-grid';

describe('PhotoGrid', () => {
  let component: PhotoGrid;
  let fixture: ComponentFixture<PhotoGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
