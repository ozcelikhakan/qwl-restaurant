import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Represents a physical table on the restaurant floor plan.
 */
export interface FloorTable {
  id: number;

  /**
   * Display label of the table, such as M01, M02, M03.
   */
  label: string;

  /**
   * Maximum seating capacity of the table.
   */
  capacity: 2 | 4 | 6;

  /**
   * Grid column position.
   * This value is 1-based.
   */
  col: number;

  /**
   * Grid row position.
   * This value is 1-based.
   */
  row: number;

  /**
   * Optional column span value.
   * Can be used if a table should take more than one grid column.
   */
  colSpan?: number;
}

/**
 * Static table layout used to render the restaurant floor plan.
 */
export const FLOOR_TABLES: FloorTable[] = [
  // Window-side 2-person tables
  { id: 1,  label: 'M01', capacity: 2, col: 1, row: 1 },
  { id: 2,  label: 'M02', capacity: 2, col: 1, row: 2 },
  { id: 3,  label: 'M03', capacity: 2, col: 1, row: 3 },

  // Center 4-person tables
  { id: 7,  label: 'M07', capacity: 4, col: 3, row: 1 },
  { id: 8,  label: 'M08', capacity: 4, col: 3, row: 2 },
  { id: 9,  label: 'M09', capacity: 4, col: 3, row: 3 },

  // Bar-side 2-person tables
  { id: 4,  label: 'M04', capacity: 2, col: 5, row: 1 },
  { id: 5,  label: 'M05', capacity: 2, col: 5, row: 2 },
  { id: 6,  label: 'M06', capacity: 2, col: 5, row: 3 },

  // Back-center 4-person tables
  { id: 10, label: 'M10', capacity: 4, col: 3, row: 5 },
  { id: 11, label: 'M11', capacity: 4, col: 1, row: 5 },
  { id: 12, label: 'M12', capacity: 4, col: 5, row: 5 },

  // Private dining 6-person tables
  { id: 13, label: 'M13', capacity: 6, col: 1, row: 7 },
  { id: 14, label: 'M14', capacity: 6, col: 3, row: 7 },
  { id: 15, label: 'M15', capacity: 6, col: 5, row: 7 },
  { id: 16, label: 'M16', capacity: 6, col: 3, row: 8 },
];

/**
 * Represents the UI state of a table cell.
 */
export interface TableCellState {
  /**
   * The table data rendered inside the cell.
   */
  table: FloorTable;

  /**
   * True if the table is already reserved.
   */
  isOccupied: boolean;

  /**
   * True if the table is currently selected by the user.
   */
  isSelected: boolean;

  /**
   * True if the table capacity matches the required capacity.
   */
  isCompatible: boolean;
}

@Component({
  selector: 'app-floor-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-plan.component.html',
})
export class FloorPlanComponent {
  /**
   * Labels of tables that are already reserved.
   */
  occupiedLabels = input<string[]>([]);

  /**
   * Label of the currently selected table.
   */
  selectedLabel = input<string | null>(null);

  /**
   * Required table capacity.
   * Tables with a different capacity will be marked as incompatible.
   */
  requiredCapacity = input<2 | 4 | 6>(2);

  /**
   * Controls whether the floor plan can be clicked.
   * If false, the component works in read-only mode.
   */
  interactive = input<boolean>(true);

  /**
   * Emits the selected table when the user clicks a compatible and available table.
   */
  tableClick = output<FloorTable>();

  /**
   * Emits when the user clicks an incompatible table.
   */
  incompatibleClick = output<void>();

  /**
   * Computes the UI state for each table.
   * This combines static table data with occupied, selected and compatibility states.
   */
  cells = computed<TableCellState[]>(() => {
    const occupied = this.occupiedLabels();
    const selected = this.selectedLabel();
    const requiredCapacity = this.requiredCapacity();

    return FLOOR_TABLES.map(table => ({
      table,
      isOccupied: occupied.includes(table.label),
      isSelected: table.label === selected,
      isCompatible: table.capacity === requiredCapacity,
    }));
  });

  /**
   * Returns the CSS classes for a table cell based on its current state.
   */
  cellClass(cell: TableCellState): string {
    if (cell.isSelected) {
      return 'bg-owl-primary text-white border-2 border-owl-primary shadow-lg scale-105';
    }

    if (cell.isOccupied) {
      return 'bg-red-50 text-red-300 border-2 border-red-200 cursor-not-allowed';
    }

    if (!cell.isCompatible) {
      return 'bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed opacity-60';
    }

    if (this.interactive()) {
      return 'bg-white text-owl-text border-2 border-gray-200 hover:border-owl-primary hover:text-owl-primary cursor-pointer hover:shadow-md transition-all';
    }

    return 'bg-white text-owl-dark border-2 border-gray-200';
  }

  /**
   * Handles table click events.
   * Ignores clicks when the component is not interactive or the table is occupied.
   */
  onCellClick(cell: TableCellState): void {
    if (!this.interactive()) return;

    if (cell.isOccupied) return;

    if (!cell.isCompatible) {
      this.incompatibleClick.emit();
      return;
    }

    this.tableClick.emit(cell.table);
  }

  /**
   * Creates an array used to render visual capacity dots.
   * Example: capacity 4 returns [0, 0, 0, 0].
   */
  capacityDots(capacity: 2 | 4 | 6): number[] {
    return Array(capacity).fill(0);
  }
}