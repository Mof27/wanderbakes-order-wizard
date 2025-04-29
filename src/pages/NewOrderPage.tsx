
import OrderForm from "@/components/orders/OrderForm";
import { Helmet } from "react-helmet-async";

const NewOrderPage = () => {
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Create New Order | Cake Shop</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      <OrderForm />
    </div>
  );
};

export default NewOrderPage;
