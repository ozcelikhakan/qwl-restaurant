export interface MenuCategory {
    id: number;
    name: string;
    slug: string;
    displayOrder: number;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    ingredients: string | null;
    price: number;
    imageUrl: string | null;
    menuCategoryId: number;
    categoryName: string;
    categorySlug: string;
}

export interface CreateMenuItemDto {
    name: string;
    description: string | null;
    ingredients: string | null;
    price: number;
    imageUrl: string;
    displayOrder: number;
    menuCategoryId: number;
}

export interface DailySpecial {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    displayOrder: number;
}