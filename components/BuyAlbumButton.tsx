"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(
      `script[src="${CHECKOUT_SRC}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Props = {
  albumId: string;
  priceRupees: number;
  loggedIn: boolean;
};

export default function BuyAlbumButton({ albumId, priceRupees, loggedIn }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setError(null);

    if (!loggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        setError("Could not load Razorpay. Check your connection.");
        return;
      }

      const { data } = await axios.post("/api/payments/create-order", { albumId });

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.albumName,
        description: `Album by ${data.albumArtist}`,
        order_id: data.orderId,
        theme: { color: "#000000" },
        handler: async (response) => {
          try {
            await axios.post("/api/payments/verify", response);
            router.refresh();
          } catch (err) {
            console.error("verify failed", err);
            setError("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Could not start checkout";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="h-9 px-5 flex items-center justify-center cursor-pointer bg-white text-black rounded hover:bg-white/90 font-medium disabled:opacity-60"
      >
        {loading ? "Starting…" : `Buy ₹${priceRupees}`}
      </button>
      {error && <p className="text-xs text-red-300 mt-1">{error}</p>}
    </div>
  );
}
