
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-cake-primary">404</h1>
        <p className="text-xl text-cake-text mb-4">Oops! Page not found</p>
        <Link to="/">
          <Button className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
