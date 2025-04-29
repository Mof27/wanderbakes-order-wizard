
import { Card, CardContent } from "@/components/ui/card";
import { Ingredient } from "@/types";

interface IngredientsSectionProps {
  ingredients: Ingredient[];
}

const IngredientsSection = ({ ingredients }: IngredientsSectionProps) => {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Ingredients (Bill of Material)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Ingredient</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id} className="border-b last:border-0">
                <td className="py-2">{ingredient.name}</td>
                <td className="text-right py-2">{ingredient.quantity}</td>
                <td className="text-right py-2">{ingredient.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default IngredientsSection;
