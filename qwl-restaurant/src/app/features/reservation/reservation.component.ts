import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBannerComponent, BreadcrumbItem } from '../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { FloorPlanComponent, FloorTable, FLOOR_TABLES } from '../../shared/components/floor-plan/floor-plan.component';
import { ReservationService } from '../../core/services/reservation.service';

/**
 * Static floor table list used by the reservation page.
 */
const TABLES = FLOOR_TABLES;

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [FormsModule, PageBannerComponent, ScrollAnimateDirective, FloorPlanComponent],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent {
  /**
   * Injects the reservation service.
   * Used to fetch occupied tables and create reservations.
   */
  private reservationService = inject(ReservationService);

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Reservation' }
  ];

  /**
   * Reservation form model.
   */
  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    message: ''
  };

  /**
   * Tracks whether the reservation was submitted successfully.
   */
  submitted = signal(false);

  /**
   * Tracks whether the reservation request is currently being submitted.
   */
  submitting = signal(false);

  /**
   * Stores reservation submission error messages.
   */
  submitError = signal('');

  /**
   * Stores the current step of the reservation form.
   */
  currentStep = signal(1);

  /**
   * Stores the selected time slot.
   */
  selectedTimeSlot = signal('');

  /**
   * Stores the selected table ID.
   */
  selectedTableId = signal<number | null>(null);

  /**
   * Stores the selected guest count.
   */
  guestCount = signal(2);

  /**
   * Stores occupied table labels returned from the API.
   */
  occupiedLabels = signal<string[]>([]);

  /**
   * Tracks whether occupied table data is currently being loaded.
   */
  loadingTables = signal(false);

  /**
   * Triggers a small shake animation when the selected table is incompatible.
   */
  guestShake = signal(false);

  /**
   * Total number of reservation steps.
   */
  readonly totalSteps = 3;

  /**
   * Reservation form steps.
   */
  steps = [
    { num: 1, label: 'Guest Information' },
    { num: 2, label: 'Date & Time' },
    { num: 3, label: 'Confirmation' },
  ];

  /**
   * Available reservation time slots.
   */
  timeSlots = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  /**
   * Restaurant working hours displayed on the reservation page.
   */
  workingHours = [
    { day: 'Monday – Friday', hours: '12:00 – 23:00' },
    { day: 'Saturday', hours: '11:00 – 24:00' },
    { day: 'Sunday', hours: '11:00 – 22:00' },
  ];

  /**
   * Returns the selected table object.
   */
  selectedTable = computed(() => {
    const id = this.selectedTableId();

    return id
      ? TABLES.find(table => table.id === id) ?? null
      : null;
  });

  /**
   * Returns the selected table label.
   */
  selectedLabel = computed(() => this.selectedTable()?.label ?? null);

  /**
   * Calculates the required table capacity based on guest count.
   */
  requiredCapacity = computed((): 2 | 4 | 6 => this.capacityFor(this.guestCount()));

  /**
   * Converts guest count into the nearest supported table capacity.
   */
  private capacityFor(guests: number): 2 | 4 | 6 {
    if (guests <= 2) {
      return 2;
    }

    if (guests <= 4) {
      return 4;
    }

    return 6;
  }

  /**
   * Automatically assigns the first available table matching the required capacity.
   */
  private autoAssign(): void {
    const occupied = this.occupiedLabels();
    const capacity = this.capacityFor(this.form.guests);
    const freeTables = TABLES.filter(
      table => table.capacity === capacity && !occupied.includes(table.label)
    );

    this.selectedTableId.set(freeTables.length ? freeTables[0].id : null);
  }

  /**
   * Fetches occupied tables for the selected date and time.
   */
  private fetchOccupied(): void {
    if (!this.form.date || !this.form.time) {
      return;
    }

    this.loadingTables.set(true);

    this.reservationService.getOccupiedTables(this.form.date, this.form.time + ':00').subscribe({
      next: labels => {
        this.occupiedLabels.set(labels);
        this.loadingTables.set(false);
        this.autoAssign();
      },
      error: () => {
        this.occupiedLabels.set([]);
        this.loadingTables.set(false);
        this.autoAssign();
      }
    });
  }

  /**
   * Selects a reservation time slot and refreshes occupied table data.
   */
  selectTimeSlot(slot: string): void {
    this.form.time = slot;
    this.selectedTimeSlot.set(slot);
    this.selectedTableId.set(null);
    this.fetchOccupied();
  }

  /**
   * Refreshes occupied table data when the reservation date changes.
   */
  onDateChange(): void {
    if (this.form.time) {
      this.selectedTableId.set(null);
      this.fetchOccupied();
    }
  }

  /**
   * Selects a table from the floor plan.
   */
  onTableClick(table: FloorTable): void {
    this.selectedTableId.set(table.id);
  }

  /**
   * Triggers feedback when a selected table is not compatible with the guest count.
   */
  onTableIncompatible(): void {
    this.guestShake.set(true);
    setTimeout(() => this.guestShake.set(false), 450);
  }

  /**
   * Moves to the next reservation step.
   */
  nextStep(): void {
    this.currentStep.update(value => value < this.totalSteps ? value + 1 : value);
  }

  /**
   * Moves to the previous reservation step.
   */
  prevStep(): void {
    this.currentStep.update(value => value > 1 ? value - 1 : value);
  }

  /**
   * Decreases the guest count.
   */
  decreaseGuests(): void {
    if (this.form.guests > 1) {
      this.form.guests--;
      this.guestCount.set(this.form.guests);
      this.autoAssign();
    }
  }

  /**
   * Increases the guest count.
   */
  increaseGuests(): void {
    if (this.form.guests < 20) {
      this.form.guests++;
      this.guestCount.set(this.form.guests);
      this.autoAssign();
    }
  }

  /**
   * Creates a new reservation.
   */
  onSubmit(): void {
    this.submitError.set('');
    this.submitting.set(true);

    this.reservationService.create({
      fullName: `${this.form.firstName} ${this.form.lastName}`.trim(),
      email: this.form.email,
      phone: this.form.phone,
      reservationDate: this.form.date,
      reservationTime: this.form.time ? this.form.time + ':00' : '00:00:00',
      personCount: this.form.guests,
      message: this.form.message || null,
      tableNumber: this.selectedTable()?.label ?? null,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set('Reservation could not be submitted. Please try again.');
      },
    });
  }
}