
import React from "react";
import MainLayout from "./MainLayout";
import AuthStatus from "./AuthStatus";

interface AuthMainLayoutProps {
  children: React.ReactNode;
}

const AuthMainLayout: React.FC<AuthMainLayoutProps> = ({ children }) => {
  const renderExtraHeaderContent = () => {
    return <AuthStatus />;
  };

  return (
    <MainLayout extraHeaderContent={renderExtraHeaderContent()}>
      {children}
    </MainLayout>
  );
};

export default AuthMainLayout;
