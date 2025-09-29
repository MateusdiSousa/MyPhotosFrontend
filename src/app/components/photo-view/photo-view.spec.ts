import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoView } from './photo-view';

describe('PhotoView', () => {
  let component: PhotoView;
  let fixture: ComponentFixture<PhotoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
