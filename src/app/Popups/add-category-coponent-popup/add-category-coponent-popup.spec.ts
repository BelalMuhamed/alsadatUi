import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoryCoponentPopup } from './add-category-coponent-popup';

describe('AddCategoryCoponentPopup', () => {
  let component: AddCategoryCoponentPopup;
  let fixture: ComponentFixture<AddCategoryCoponentPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCategoryCoponentPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCategoryCoponentPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
