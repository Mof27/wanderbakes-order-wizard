
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsCategoryCard from "./SettingsCategoryCard";
import { useAuth } from "@/context/AuthContext";
import DataMigrationTool from "./DataMigrationTool";

const SettingsLayout: React.FC = () => {
  const { isConfigured } = useAuth();
  const [showMigrationTool, setShowMigrationTool] = useState(false);
  
  return (
    <>
      <Helmet>
        <title>Settings | Cake Shop</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your shop settings, product options, and print templates
          </p>
        </div>
        
        {isConfigured && (
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setShowMigrationTool(!showMigrationTool)}
            >
              {showMigrationTool ? "Hide" : "Show"} Data Migration Tool
            </Button>
            
            {showMigrationTool && (
              <div className="mt-4">
                <DataMigrationTool />
              </div>
            )}
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SettingsCategoryCard
            title="Cake Sizes"
            description="Manage available cake sizes"
            to="cake-sizes"
            icon="cake"
          />
          <SettingsCategoryCard
            title="Cake Shapes"
            description="Manage available cake shapes"
            to="cake-shapes"
            icon="square"
          />
          <SettingsCategoryCard
            title="Cake Flavors"
            description="Manage available cake flavors"
            to="cake-flavors"
            icon="utensils"
          />
          <SettingsCategoryCard
            title="Colors"
            description="Manage color options"
            to="colors"
            icon="palette"
          />
          <SettingsCategoryCard
            title="Print Templates"
            description="Customize order print templates"
            to="print-templates"
            icon="printer"
          />
          <SettingsCategoryCard
            title="Delivery Labels"
            description="Customize delivery label templates"
            to="delivery-labels"
            icon="tag"
          />
          <SettingsCategoryCard
            title="Delivery Settings"
            description="Configure delivery drivers and options"
            to="delivery"
            icon="truck"
          />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SettingsCategoryCard
              title="Data Mode"
              description={`Current mode: ${isConfigured ? "Supabase" : "Mock"}`}
              to="data-mode"
              icon="database"
              className="h-full"
            />
          </CardContent>
        </Card>
        
        <Outlet />
      </div>
    </>
  );
};

export default SettingsLayout;
