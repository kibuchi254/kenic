import React, { useState } from "react";
import { FaMoneyBill, FaCreditCard, FaPaypal } from "react-icons/fa";
import { MdDomain } from "react-icons/md";

export default function DomainCheckout() {
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const domain = {
    name: "myawesomebrand.co.ke",
    price: 1200,
    renewal: 1200,
    taxRate: 0.16,
  };

  const tax = domain.price * domain.taxRate;
  const total = domain.price + tax;

  const handleCheckout = (e) => {
    e.preventDefault();
    alert(`Processing payment via ${paymentMethod.toUpperCase()}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Domain Summary */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-green-600">
              <MdDomain size={28} /> Domain Summary
            </h2>
            <div className="mt-4 border-t pt-4 space-y-2">
              <p className="text-lg font-medium">{domain.name}</p>
              <p className="text-gray-600">Registration Price: KES {domain.price.toLocaleString()}</p>
              <p className="text-gray-600">Annual Renewal: KES {domain.renewal.toLocaleString()}</p>
            </div>
          </div>

          {/* Contact Info */}
          <form onSubmit={handleCheckout} className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-green-600">Registrant Contact Information</h2>
            <input type="text" placeholder="Full Name" required className="w-full border rounded-lg px-4 py-2" />
            <input type="email" placeholder="Email Address" required className="w-full border rounded-lg px-4 py-2" />
            <input type="tel" placeholder="Phone Number" required className="w-full border rounded-lg px-4 py-2" />
            
            {/* Payment Method */}
            <h2 className="text-xl font-bold text-green-600 pt-4">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button type="button"
                onClick={() => setPaymentMethod("mpesa")}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg ${paymentMethod === "mpesa" ? "border-green-600 bg-green-50" : "border-gray-300"}`}>
                <FaMoneyBill size={24} className="text-green-600" />
                <span>M-Pesa</span>
              </button>
              <button type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg ${paymentMethod === "card" ? "border-green-600 bg-green-50" : "border-gray-300"}`}>
                <FaCreditCard size={24} className="text-green-600" />
                <span>Card</span>
              </button>
              <button type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg ${paymentMethod === "paypal" ? "border-green-600 bg-green-50" : "border-gray-300"}`}>
                <FaPaypal size={24} className="text-green-600" />
                <span>PayPal</span>
              </button>
            </div>

            <button type="submit"
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg shadow hover:opacity-90">
              Complete Purchase
            </button>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white rounded-2xl shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-green-600">Order Summary</h2>
          <div className="mt-4 border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Domain Price</span>
              <span>KES {domain.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (16%)</span>
              <span>KES {tax.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
