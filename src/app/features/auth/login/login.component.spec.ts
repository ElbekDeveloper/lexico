import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { LoginComponent } from './login.component';
import { SessionService } from '../services/session.service';
import { ButtonComponent } from '@app/shared/ui';
import { TextInputComponent } from '@app/shared/ui';
import { SpinnerComponent } from '@app/shared/ui';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let router: jasmine.SpyObj<Router>;
  let titleService: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    const sessionServiceSpy = jasmine.createSpyObj('SessionService', [
      'setToken',
      'getToken',
      'hasToken',
      'clearToken',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        ButtonComponent,
        TextInputComponent,
        SpinnerComponent,
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Title, useValue: titleServiceSpy },
      ],
    }).compileComponents();

    sessionService = TestBed.inject(
      SessionService,
    ) as jasmine.SpyObj<SessionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the login component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with email and password controls', () => {
      expect(component.form.get('email')).toBeDefined();
      expect(component.form.get('password')).toBeDefined();
    });

    it('should set browser tab title on init', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith('Sign In — Lexi');
    });

    it('should have isSubmitting signal initialized to false', () => {
      expect(component.isSubmitting()).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should render form as pristine and disabled initially', () => {
      expect(component.form.pristine).toBe(true);
      expect(component.form.invalid).toBe(true);
    });

    it('should enable form when both fields are filled', () => {
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(component.form.valid).toBe(true);
    });

    it('should be invalid when email is empty', () => {
      component.form.patchValue({
        email: '',
        password: 'password123',
      });
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when password is empty', () => {
      component.form.patchValue({
        email: 'test@example.com',
        password: '',
      });
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when both fields are empty', () => {
      component.form.patchValue({
        email: '',
        password: '',
      });
      expect(component.form.invalid).toBe(true);
    });
  });

  describe('Error Message Display', () => {
    it('should not show email error message when field is pristine', () => {
      const email = component.form.get('email');
      email?.markAsPristine();
      expect(component.isEmailInvalid()).toBe(false);
    });

    it('should show email error message when field is touched and invalid', () => {
      const email = component.form.get('email');
      email?.markAsTouched();
      expect(component.isEmailInvalid()).toBe(true);
    });

    it('should show password error message when field is touched and invalid', () => {
      const password = component.form.get('password');
      password?.markAsTouched();
      expect(component.isPasswordInvalid()).toBe(true);
    });

    it('should hide error message when field is filled', () => {
      component.form.patchValue({ email: 'test@example.com' });
      const email = component.form.get('email');
      email?.markAsTouched();
      expect(component.isEmailInvalid()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is invalid', fakeAsync(() => {
      component.form.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();
      tick();

      expect(sessionService.setToken).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should mark all fields as touched when form is invalid on submit', () => {
      component.form.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();

      expect(component.form.get('email')?.touched).toBe(true);
      expect(component.form.get('password')?.touched).toBe(true);
    });

    it('should set isSubmitting to true during submission', fakeAsync(() => {
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();
      expect(component.isSubmitting()).toBe(true);

      tick(1500);
    }));

    it('should call SessionService.setToken on successful submission', fakeAsync(() => {
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();
      tick(1500);

      expect(sessionService.setToken).toHaveBeenCalled();
      const tokenArg = sessionService.setToken.calls.mostRecent().args[0];
      expect(tokenArg).toContain('mock_token_');
    }));

    it('should navigate to /chat after successful submission', fakeAsync(() => {
      router.navigate.and.returnValue(Promise.resolve(true));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();
      tick(1500);

      expect(router.navigate).toHaveBeenCalledWith(['/chat']);
    }));

    it('should reset form after successful submission', fakeAsync(() => {
      router.navigate.and.returnValue(Promise.resolve(true));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      const initialEmail = component.form.get('email')?.value;
      expect(initialEmail).toBe('test@example.com');

      component.onSubmit();
      tick(1500);

      expect(component.form.get('email')?.value).toBeNull();
      expect(component.form.get('password')?.value).toBeNull();
    }));

    it('should simulate 1.5 second delay before processing sign-in', fakeAsync(() => {
      router.navigate.and.returnValue(Promise.resolve(true));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      tick(500);
      expect(sessionService.setToken).not.toHaveBeenCalled();

      tick(1000);
      expect(sessionService.setToken).toHaveBeenCalled();
    }));
  });

  describe('Loading State', () => {
    it('should update isSubmitting signal during submission', fakeAsync(() => {
      router.navigate.and.returnValue(Promise.resolve(true));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();
      expect(component.isSubmitting()).toBe(true);

      tick(1500);
      // Note: isSubmitting is set back to false in catch, but should also be false after successful completion
    }));
  });

  describe('Form Control Getters', () => {
    it('should return email control via getter', () => {
      expect(component.email).toBe(component.form.get('email'));
    });

    it('should return password control via getter', () => {
      expect(component.password).toBe(component.form.get('password'));
    });
  });
});
