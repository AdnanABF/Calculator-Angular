import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // We use signals to hold the state of our calculator
  displayValue = signal<string>('0');
  firstOperand = signal<number | null>(null);
  operator = signal<string | null>(null);
  waitingForSecondOperand = signal<boolean>(false);

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
    if (this.waitingForSecondOperand()) {
      this.displayValue.set(num);
      this.waitingForSecondOperand.set(false);
    } else {
      const current = this.displayValue();
      this.displayValue.set(current === '0' ? num : current + num);
    }
  }

  // Method to handle operator button clicks (+, -, *, /)
  setOperator(op: string): void {
    this.firstOperand.set(Number(this.displayValue()));
    this.operator.set(op);
    this.waitingForSecondOperand.set(true);
  }

  // Method to calculate the final result
  calculate(): void {
    const secondOperand = Number(this.displayValue());
    const firstValue = this.firstOperand();
    const op = this.operator();

    if (op === '+') this.displayValue.set((firstValue! + secondOperand).toString());
    if (op === '-') this.displayValue.set((firstValue! - secondOperand).toString());
    if (op === '*') this.displayValue.set((firstValue! * secondOperand).toString());
    if (op === '/') this.displayValue.set((firstValue! / secondOperand).toString());

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

  // Remove the last digit from the display
  backspace(): void {
    const current = this.displayValue();
    if (current.length > 1) {
      this.displayValue.set(current.slice(0, -1));
    } else {
      this.displayValue.set('0');
    }
  }
}
