"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BillingForm({ currentBillingPlan, onSubmit }) {
  const [billingPlan, setBillingPlan] = useState(currentBillingPlan || "FREE");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    onSubmit({ billingPlan, cardNumber, expirationDate, cvv })
      .catch((error) => {
        console.error("Failed to update billing information:", error);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="billingPlan">Subscription Plan</Label>
        <Select
          value={billingPlan}
          onValueChange={setBillingPlan}
        >
          <SelectTrigger id="billingPlan">
            <SelectValue placeholder="Select a subscription plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="BASIC">Basic</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          type="text"
          id="cardNumber"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="Enter card number"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expirationDate">Expiration Date</Label>
        <Input
          type="text"
          id="expirationDate"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          placeholder="MM/YY"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cvv">CVV</Label>
        <Input
          type="text"
          id="cvv"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          placeholder="CVV"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Billing Information"}
      </Button>
    </form>
  );
}
