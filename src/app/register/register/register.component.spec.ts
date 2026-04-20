import { NO_ERRORS_SCHEMA, SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { of } from "rxjs";

import { HttpRequestService } from "src/app/http-request/http-request.service";

import { RegisterComponent } from "./register.component";

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpRequestServiceSpy: jasmine.SpyObj<HttpRequestService>;

  beforeEach(async () => {
    httpRequestServiceSpy = jasmine.createSpyObj("HttpRequestService", [
      "request",
    ]);
    httpRequestServiceSpy.request.and.returnValue(
      of({
        success: true,
        data: {},
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: HttpRequestService, useValue: httpRequestServiceSpy },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj("MatDialog", ["open"]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should auto-enable location detection for seller registration", () => {
    component.ngOnChanges({
      currentDisplay: new SimpleChange("", "seller-form", true),
    });

    expect(component.detectCurrentLocation).toBeTrue();
    expect(component.registrationForm.get("businessname")).toBeTruthy();
  });

  it("should block seller registration when no map location is selected", () => {
    component.ngOnChanges({
      currentDisplay: new SimpleChange("", "seller-form", true),
    });
    component.registrationForm.patchValue({
      businessname: "SpoonWise Test Shop",
      firstname: "Spoon",
      lastname: "Wise",
      email: "seller@gmail.com",
      passwordGroup: {
        password: "Password1!",
        confirmPassword: "Password1!",
      },
    });

    component.createAccount();

    expect(component.sellerLocationErrorMessage).toBe(
      "Allow location access or select your business location on the map to continue.",
    );
    expect(httpRequestServiceSpy.request).not.toHaveBeenCalled();
  });
});
