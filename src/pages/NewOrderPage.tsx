
import OrderForm from "@/components/orders/OrderForm";

const NewOrderPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      <OrderForm />
    </div>
  );
};

export default NewOrderPage;
