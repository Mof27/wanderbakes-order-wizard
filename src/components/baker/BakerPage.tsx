
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BakerDashboard from './BakerDashboard';

const BakerPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Helmet>
        <title>Baker Dashboard | Cake Shop</title>
      </Helmet>
      
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Baker Dashboard</h1>
        <p className="text-muted-foreground">Manage your baking tasks and inventory</p>
      </header>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="production">Production Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <BakerDashboard />
        </TabsContent>
        
        <TabsContent value="recipes">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Recipes management coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Inventory management coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="production">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Production log coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BakerPage;
