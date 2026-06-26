import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { MenuCategory, MenuItem as MenuItemDto, CreateMenuItemDto, DailySpecial } from '../../core/models/menu.models';

interface MenuItem {
  id: number;
  img: string;
  name: string;
  price: number;
  category: string;   // categorySlug
  categoryId: number;
  ingredients: string[];
}

interface CatTab { key: string; label: string; }

// Maps menu item DTO data to the local menu item model
function mapDto(i: MenuItemDto): MenuItem {
  return {
    id:          i.id,
    img:         i.imageUrl ?? '',
    name:        i.name,
    price:       i.price,
    category:    i.categorySlug,
    categoryId:  i.menuCategoryId,
    ingredients: i.ingredients ? i.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
  };
}

// Form model — price is nullable so the input can start empty instead of showing 0
type MenuItemForm = Omit<MenuItem, 'id' | 'price'> & { price: number | null };

// Returns the default empty menu item form data
const emptyForm = (firstSlug = '', firstId = 0): MenuItemForm => ({
  img: '', name: '', price: null, category: firstSlug, categoryId: firstId, ingredients: []
});

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit {
  // Inject menu service to load and manage menu data
  private svc = inject(MenuService);

  // Menu item page state
  items      = signal<MenuItem[]>([]);
  loading    = signal(true);
  error      = signal('');
  activeTab  = signal('all');
  modalOpen  = signal(false);
  editingId  = signal<number | null>(null);
  form       = signal(emptyForm());
  ingredientInput = signal('');

  // Category state
  categories    = signal<CatTab[]>([{ key: 'all', label: 'All' }]);
  categoryMap   = signal<MenuCategory[]>([]);
  categoryLabels = computed<Record<string, string>>(() =>
    Object.fromEntries(this.categories().map(c => [c.key, c.label]))
  );

  // Save state
  saving    = signal(false);
  saveError = signal('');

  // ── Daily Specials ───────────────────────────────────────
  mainTab         = signal<'items' | 'specials'>('items');
  specials        = signal<DailySpecial[]>([]);
  specialModal    = signal(false);
  specialSaving   = signal(false);
  specialError    = signal('');
  specialForm     = signal<{ title: string; desc: string; price: number | null; imageUrl: string; displayOrder: number }>({ title: '', desc: '', price: null, imageUrl: '', displayOrder: 0 });
  pickedItemId    = signal(0);

  // Filters menu items by the selected category tab
  filtered = computed(() => {
    const tab = this.activeTab();
    return tab === 'all' ? this.items() : this.items().filter(i => i.category === tab);
  });

  // Loads categories, menu items, and daily specials when the component is initialized
  ngOnInit(): void {
    forkJoin({
      cats:     this.svc.getCategories(),
      items:    this.svc.getItems(),
      specials: this.svc.getDailySpecials(),
    }).subscribe({
      next: ({ cats, items, specials }) => {
        this.categoryMap.set(cats);
        this.categories.set([
          { key: 'all', label: 'All' },
          ...cats.map(c => ({ key: c.slug, label: c.name })),
        ]);
        this.items.set(items.map(mapDto));
        this.specials.set(specials);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Menu could not be loaded.');
        this.loading.set(false);
      }
    });
  }

  // Opens the modal for creating a new menu item
  openAdd(): void {
    const cats = this.categoryMap();
    const first = cats[0];
    this.editingId.set(null);
    this.form.set(emptyForm(first?.slug ?? '', first?.id ?? 0));
    this.ingredientInput.set('');
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  // Opens the modal for editing an existing menu item
  openEdit(item: MenuItem): void {
    this.editingId.set(item.id);
    this.form.set({ ...item, ingredients: [...item.ingredients] });
    this.ingredientInput.set('');
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  // Adds a new ingredient to the menu item form
  addIngredient(): void {
    const val = this.ingredientInput().trim();
    if (!val) return;
    this.form.update(f => ({ ...f, ingredients: [...f.ingredients, val] }));
    this.ingredientInput.set('');
  }

  // Removes an ingredient from the menu item form
  removeIngredient(idx: number): void {
    this.form.update(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  }

  // Updates selected category data in the form
  onCategoryChange(slug: string): void {
    const cat = this.categoryMap().find(c => c.slug === slug);
    this.form.update(f => ({ ...f, category: slug, categoryId: cat?.id ?? 0 }));
  }

  // Saves a new menu item or updates the selected menu item
  save(): void {
    const f = this.form();
    if (!f.name.trim()) { this.saveError.set('Item name is required.'); return; }
    if (!f.categoryId)  { this.saveError.set('Please select a category.'); return; }
    if (!f.price || f.price <= 0) { this.saveError.set('Price must be greater than 0.'); return; }
    this.saveError.set('');
    this.saving.set(true);
    const dto: CreateMenuItemDto = {
      name:           f.name,
      description:    null,
      ingredients:    f.ingredients.join(', ') || null,
      price:          f.price,
      imageUrl:       f.img || null,
      displayOrder:   0,
      menuCategoryId: f.categoryId,
    };
    const id = this.editingId();
    const onError = () => {
      this.saving.set(false);
      this.saveError.set('Save failed. Please try again.');
    };
    if (id) {
      this.svc.updateItem(id, dto).subscribe({
        next: updated => {
          this.items.update(list => list.map(i => i.id === id ? mapDto(updated) : i));
          this.saving.set(false);
          this.modalOpen.set(false);
        },
        error: onError,
      });
    } else {
      this.svc.createItem(dto).subscribe({
        next: created => {
          this.items.update(list => [...list, mapDto(created)]);
          this.saving.set(false);
          this.modalOpen.set(false);
        },
        error: onError,
      });
    }
  }

  // Deletes a menu item
  delete(id: number): void {
    this.svc.deleteItem(id).subscribe({
      next: () => this.items.update(list => list.filter(i => i.id !== id))
    });
  }

  // Updates a single field in the menu item form
  updateFormField(field: keyof ReturnType<typeof emptyForm>, value: string | number | null): void {
    if (field === 'category') { this.onCategoryChange(value as string); return; }
    this.form.update(f => ({ ...f, [field]: value }));
  }

  // ── Daily Specials ───────────────────────────────────────

  // Opens the modal for creating a new daily special
  openAddSpecial(): void {
    this.specialForm.set({ title: '', desc: '', price: null, imageUrl: '', displayOrder: this.specials().length });
    this.pickedItemId.set(0);
    this.specialError.set('');
    this.specialModal.set(true);
  }

  // Fills the daily special form with the selected menu item data
  pickMenuItem(id: number): void {
    this.pickedItemId.set(id);
    if (!id) return;
    const item = this.items().find(i => i.id === id);
    if (item) {
      this.specialForm.update(f => ({
        ...f,
        title:    item.name,
        desc:     item.ingredients.join(', '),
        price:    item.price,
        imageUrl: item.img,
      }));
    }
  }

  // Updates a single field in the daily special form
  updateSpecialField(field: 'title' | 'desc' | 'price' | 'imageUrl' | 'displayOrder', value: string | number | null): void {
    this.specialForm.update(f => ({ ...f, [field]: value }));
  }

  // Saves a new daily special
  saveSpecial(): void {
    const f = this.specialForm();
    if (!f.title.trim()) { this.specialError.set('Title is required.'); return; }
    if (!f.price || f.price <= 0) { this.specialError.set('Price must be greater than 0.'); return; }
    this.specialError.set('');
    this.specialSaving.set(true);
    this.svc.createDailySpecial({
      id:           0,
      title:        f.title,
      description:  f.desc,
      price:        f.price,
      imageUrl:     f.imageUrl || null,
      displayOrder: f.displayOrder,
    }).subscribe({
      next: created => {
        this.specials.update(list => [...list, created]);
        this.specialSaving.set(false);
        this.specialModal.set(false);
      },
      error: () => {
        this.specialSaving.set(false);
        this.specialError.set('Special could not be added. Please try again.');
      },
    });
  }

  // Deletes a daily special
  deleteSpecial(id: number): void {
    this.svc.deleteDailySpecial(id).subscribe({
      next: () => this.specials.update(list => list.filter(s => s.id !== id)),
    });
  }
}