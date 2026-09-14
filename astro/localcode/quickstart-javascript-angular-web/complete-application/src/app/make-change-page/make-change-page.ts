import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-make-change-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-change-page.html',
  styleUrls: ['./make-change-page.css']
})
export class MakeChangePage {
  amount = 0;
  change: { total: number; nickels: number; pennies: number } | null = null;
  makeChange() {
    const total = this.amount;
    const totalCents = Math.round(this.amount * 100);
    const nickels = Math.floor(totalCents / 5);
    const pennies = totalCents % 5;
    this.change = {nickels, pennies, total};
  }
}