import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoItem } from './photo-item';

describe('PhotoItem', () => {
  let component: PhotoItem;
  let fixture: ComponentFixture<PhotoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
