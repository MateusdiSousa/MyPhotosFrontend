import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoUpload } from './photo-upload';

describe('PhotoUpload', () => {
  let component: PhotoUpload;
  let fixture: ComponentFixture<PhotoUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
