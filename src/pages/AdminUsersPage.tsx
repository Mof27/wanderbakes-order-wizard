
import React from "react";
import { Helmet } from "react-helmet-async";
import EmployeeManagement from "@/components/admin/EmployeeManagement";

const AdminUsersPage = () => {
  return (
    <div className="container py-8">
      <Helmet>
        <title>Employee Management | WanderBakes</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">
          Manage employee accounts and assign roles for the WanderBakes team
        </p>
      </div>
      
      <EmployeeManagement />
    </div>
  );
};

export default AdminUsersPage;
