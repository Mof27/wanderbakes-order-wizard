
import React from "react";
import { Helmet } from "react-helmet-async";
import UserDirectory from "@/components/admin/UserDirectory";

const AdminUsersPage = () => {
  return (
    <div className="container py-8">
      <Helmet>
        <title>User Directory | WanderBakes</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Directory</h1>
        <p className="text-muted-foreground">
          View all system users and their assigned roles
        </p>
      </div>
      
      <UserDirectory />
    </div>
  );
};

export default AdminUsersPage;
