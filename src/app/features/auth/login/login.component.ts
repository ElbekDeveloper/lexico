import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ButtonComponent, TextInputComponent } from '@app/shared/ui';
import { SessionService } from '../services/session.service';

/**
 * Login Component
 * 
 * Standalone component for user authentication.
 * - Uses Reactive Forms for form state management
 * - Displays shared TextInput, Button, and Spinner components
 * - Implements simulated async sign-in flow
 * - Manages form validation and loading states
 * 
 * Features:
 * - Email and password input fields (required validation)
 * - Loading spinner and disabled button during submission
 * - Session token storage on successful sign-in
 * - Automatic redirect to /chat after sign-in
 * - Browser tab title set to "Sign In — Lexi"
 * 
 * @standalone
 * @changeDetection OnPush for performance
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    TextInputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  // Form group for reactive forms
  form!: FormGroup;

  // Signal to track submission state
  isSubmitting = signal(false);

  // Simulation delay in milliseconds
  private readonly SIGN_IN_DELAY_MS = 1500;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router,
    private title: Title,
  ) {
    this.initializeForm();
  }

  /**
   * Initialize the form with email and password controls
   * Both fields are required
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  /**
   * Angular lifecycle hook
   * Set browser tab title on component initialization
   */
  ngOnInit(): void {
    this.title.setTitle('Sign In — Lexi');
  }

  /**
   * Getters for form controls (used in template)
   */
  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  /**
   * Handle form submission
   * Validates form, shows loading state, simulates sign-in, stores token, and redirects
   */
  async onSubmit(): Promise<void> {
    // Mark all fields as touched to show validation errors
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    // Set loading state
    this.isSubmitting.set(true);

    try {
      // Simulate async authentication with delay
      await this.simulateSignIn();

      // Store token in session storage
      const mockToken = `mock_token_${Date.now()}`;
      this.sessionService.setToken(mockToken);

      // Reset form after successful submission
      this.form.reset();

      // Redirect to protected page
      await this.router.navigate(['/chat']);
    } catch (error) {
      console.error('Sign-in failed:', error);
      this.isSubmitting.set(false);
    }
  }

  /**
   * Simulate an asynchronous sign-in flow
   * In production, this would be an HTTP request to the authentication service
   * @returns Promise that resolves after the simulated delay
   */
  private simulateSignIn(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.SIGN_IN_DELAY_MS);
    });
  }

  /**
   * Check if email field should show as invalid (for aria-invalid binding)
   */
  isEmailInvalid(): boolean {
    const control = this.form.get('email');
    return control ? control.invalid && control.touched : false;
  }

  /**
   * Check if password field should show as invalid (for aria-invalid binding)
   */
  isPasswordInvalid(): boolean {
    const control = this.form.get('password');
    return control ? control.invalid && control.touched : false;
  }
}
