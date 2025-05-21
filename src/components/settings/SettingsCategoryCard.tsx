
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface SettingsCategoryCardProps {
  title: string;
  description: string;
  icon: ReactNode | string;
  category?: string;
  to?: string;
  itemCount?: number;
  className?: string;
}

const SettingsCategoryCard = ({ 
  title, 
  description, 
  icon,
  category,
  to,
  itemCount,
  className = ""
}: SettingsCategoryCardProps) => {
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    if (to) {
      navigate(`/settings/${to}`);
    } else if (category) {
      navigate(`/settings/${category}`);
    }
  };

  return (
    <Card className={`hover:border-primary/50 transition-all ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="bg-muted p-2 rounded-md">
            {typeof icon === 'string' ? icon : icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {itemCount !== undefined && (
              <p className="text-xs text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
        </div>
        <CardDescription className="pt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleNavigate}
        >
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SettingsCategoryCard;
