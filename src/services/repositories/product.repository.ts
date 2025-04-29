
import { Ingredient } from "@/types";
import { BaseRepository } from "./base.repository";

export interface ProductRepository extends BaseRepository<Ingredient> {
  getIngredientsByFlavor(flavor: string): Promise<Ingredient[]>;
}

export class MockProductRepository implements ProductRepository {
  private ingredients: Record<string, Ingredient[]> = {};
  private allIngredients: Ingredient[] = [];

  constructor(initialData: Record<string, Ingredient[]> = {}) {
    this.ingredients = {...initialData};
    
    // Flatten all ingredients for the general ingredient list
    Object.values(initialData).forEach(flavorIngredients => {
      flavorIngredients.forEach(ingredient => {
        if (!this.allIngredients.find(i => i.id === ingredient.id)) {
          this.allIngredients.push(ingredient);
        }
      });
    });
  }

  async getAll(): Promise<Ingredient[]> {
    return [...this.allIngredients];
  }

  async getById(id: string): Promise<Ingredient | undefined> {
    return this.allIngredients.find(ingredient => ingredient.id === id);
  }

  async create(ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> {
    const newIngredient = {
      ...ingredient,
      id: `i${this.allIngredients.length + 1}`,
    };
    this.allIngredients.push(newIngredient);
    return newIngredient;
  }

  async update(id: string, ingredient: Partial<Ingredient>): Promise<Ingredient> {
    const index = this.allIngredients.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`Ingredient with id ${id} not found`);
    
    this.allIngredients[index] = {
      ...this.allIngredients[index],
      ...ingredient,
    };
    
    // Also update in flavor-specific ingredients
    Object.keys(this.ingredients).forEach(flavor => {
      const flavorIngredientIndex = this.ingredients[flavor].findIndex(i => i.id === id);
      if (flavorIngredientIndex !== -1) {
        this.ingredients[flavor][flavorIngredientIndex] = {
          ...this.ingredients[flavor][flavorIngredientIndex],
          ...ingredient,
        };
      }
    });
    
    return this.allIngredients[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.allIngredients.length;
    this.allIngredients = this.allIngredients.filter(i => i.id !== id);
    
    // Also remove from flavor-specific ingredients
    Object.keys(this.ingredients).forEach(flavor => {
      this.ingredients[flavor] = this.ingredients[flavor].filter(i => i.id !== id);
    });
    
    return initialLength !== this.allIngredients.length;
  }

  async getIngredientsByFlavor(flavor: string): Promise<Ingredient[]> {
    return this.ingredients[flavor] ? [...this.ingredients[flavor]] : [];
  }
}
