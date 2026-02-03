import { Component, signal, HostListener, effect, afterNextRender } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideAngularModule, Delete, History, Sun, Moon } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('historyAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0px)' })),
      ]),
    ]),
  ],
})
export class App {
  readonly DeleteIcon = Delete;
  readonly HistoryIcon = History;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;

  // State Management with Signals
  isDarkMode = signal<boolean>(false);
  displayValue = signal<string>('0');
  firstOperand = signal<number | null>(null);
  operator = signal<string | null>(null);
  waitingForSecondOperand = signal<boolean>(false);
  history = signal<string[]>([]);

  constructor() {
    // 1. Browser-only check to load initial theme
    afterNextRender(() => {
      const savedTheme = localStorage.getItem('theme') === 'true';
      if (savedTheme) {
        this.isDarkMode.set(true);
        document.documentElement.classList.add('dark');
      } else {
        this.isDarkMode.set(false);
        document.documentElement.classList.remove('dark');
      }
    });

    // 2. Effect remains safe because it only runs when signals change
    // but we add a guard for 'document' just in case.
    effect(() => {
      const dark = this.isDarkMode();
      if (typeof document !== 'undefined') {
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  // Theme Toggle: This is the ONLY place where we save to localStorage.
  toggleTheme(): void {
    this.isDarkMode.update((dark) => {
      const newState = !dark;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', newState ? 'true' : 'false');
      }
      return newState;
    });
  }

  // HostListener to capture keyboard events for better user experience
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key >= '0' && event.key <= '9') {
      this.appendNumber(event.key);
    } else if (['+', '-', '*', '/'].includes(event.key)) {
      this.setOperator(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
      this.calculate();
    } else if (event.key === 'Escape' || event.key === 'c' || event.key === 'Delete') {
      this.clear();
    } else if (event.key === 'Backspace') {
      this.backspace();
    }
  }

  // Method to handle number button clicks
  appendNumber(num: string): void {
    if (this.displayValue() === 'Error' || this.waitingForSecondOperand()) {
      this.displayValue.set(num);
      this.waitingForSecondOperand.set(false);
      return;
    }

    const current = this.displayValue();
    this.displayValue.set(current === '0' ? num : current + num);
  }

  // Method to handle operator button clicks (+, -, *, /)
  setOperator(op: string): void {
    this.firstOperand.set(Number(this.displayValue()));
    this.operator.set(op);
    this.waitingForSecondOperand.set(true);
  }

  // Method to calculate the final result
  calculate(): void {
    const op = this.operator();
    const firstValue = this.firstOperand();
    if (!op || firstValue === null) return;

    const secondOperand = Number(this.displayValue());
    let result: string = '';

    if (op === '+') result = (firstValue + secondOperand).toString();
    if (op === '-') result = (firstValue - secondOperand).toString();
    if (op === '*') result = (firstValue * secondOperand).toString();
    if (op === '/') {
      result = secondOperand === 0 ? 'Error' : (firstValue / secondOperand).toString();
    }

    this.displayValue.set(result);

    // Record the calculation in history
    const newEntry = `${firstValue} ${op} ${secondOperand} = ${result}`;
    this.history.update((oldHistory) => [newEntry, ...oldHistory]);

    this.operator.set(null);
    this.waitingForSecondOperand.set(false);
  }

  // Method to reset the calculator
  clear(): void {
    this.displayValue.set('0');
    this.firstOperand.set(null);
    this.operator.set(null);
    this.waitingForSecondOperand.set(false);
  }

  backspace(): void {
    const current = this.displayValue();
    if (current === 'Error') {
      this.clear();
      return;
    }
    if (current.length > 1) {
      this.displayValue.set(current.slice(0, -1));
    } else {
      this.displayValue.set('0');
    }
  }
}
