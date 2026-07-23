"use client";

import { useState } from "react";
import { Text, Button } from "@valenor/design-system";

type WizardStep = 'AUTH' | 'DETAILS' | 'SHIPPING' | 'REVIEW' | 'SUCCESS';

interface PieceDetails {
  id: string;
  title: string;
  chapter: string;
  price: number;
  color: string;
}

export function ReservationWizard({ piece }: { piece: PieceDetails }) {
  const [step, setStep] = useState<WizardStep>('AUTH');
  const [email, setEmail] = useState("");
  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  
  const [shipping, setShipping] = useState({
    name: "", phone: "", country: "India", street: "", city: "", province: "", postalCode: ""
  });

  return (
    <div className="w-full border border-theme bg-bg-raised/30 p-6 rounded-none transition-all duration-300">
      {step === 'AUTH' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-fg-subtle block">Step 01 // Identification</span>
            <Text role="headingSm" as="h3" className="uppercase tracking-wide">Request Piece Allocation</Text>
          </div>
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Enter Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg border border-theme px-4 py-3 font-mono text-xs tracking-wide text-fg focus:outline-none focus:border-fg transition-colors"
            />
            <Button onClick={() => setStep('DETAILS')} className="w-full uppercase font-mono tracking-wider text-xs py-4" disabled={!email}>
              Continue Framework →
            </Button>
          </div>
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-theme/30"></div>
            <span className="flex-shrink mx-4 text-[9px] font-mono text-fg-subtle uppercase tracking-widest">Or Secure Via SSO</span>
            <div className="flex-grow border-t border-theme/30"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setStep('DETAILS')} className="border border-theme text-[10px] font-mono uppercase tracking-wider py-2.5 hover:bg-bg transition-colors">Google</button>
            <button onClick={() => setStep('DETAILS')} className="border border-theme text-[10px] font-mono uppercase tracking-wider py-2.5 hover:bg-bg transition-colors">Apple</button>
          </div>
        </div>
      )}

      {step === 'DETAILS' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-fg-subtle block">{piece.chapter} // {piece.color}</span>
            <Text role="headingSm" as="h3" className="uppercase tracking-wide">{piece.title}</Text>
          </div>
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-subtle block">Select Garment Size</span>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                <button 
                  key={s} 
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-10 w-12 font-mono text-xs border transition-all ${size === s ? 'border-fg bg-fg text-bg font-bold' : 'border-theme text-fg-muted hover:border-fg'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-theme/20 flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase text-fg-subtle">Allocation Volume</span>
            <div className="flex items-center border border-theme font-mono text-xs">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 border-r border-theme">-</button>
              <span className="px-4 py-1.5">{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-3 py-1.5 border-l border-theme">+</button>
            </div>
          </div>
          <Button onClick={() => setStep('SHIPPING')} className="w-full uppercase font-mono tracking-wider text-xs py-4 mt-4">
            Proceed to Shipping →
          </Button>
        </div>
      )}

      {step === 'SHIPPING' && (
        <div className="space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-fg-subtle block">Step 03 // Logistical Routing</span>
          <div className="space-y-3">
            <input type="text" placeholder="Full Name" onChange={(e) => setShipping({...shipping, name: e.target.value})} className="w-full bg-bg border border-theme px-4 py-2.5 text-xs text-fg focus:outline-none focus:border-fg" />
            <input type="text" placeholder="Phone Number" onChange={(e) => setShipping({...shipping, phone: e.target.value})} className="w-full bg-bg border border-theme px-4 py-2.5 text-xs text-fg focus:outline-none focus:border-fg" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Province / State" onChange={(e) => setShipping({...shipping, province: e.target.value})} className="w-full bg-bg border border-theme px-4 py-2.5 text-xs text-fg focus:outline-none focus:border-fg" />
              <input type="text" placeholder="City" onChange={(e) => setShipping({...shipping, city: e.target.value})} className="w-full bg-bg border border-theme px-4 py-2.5 text-xs text-fg focus:outline-none focus:border-fg" />
            </div>
            <input type="text" placeholder="Street Address" onChange={(e) => setShipping({...shipping, street: e.target.value})} className="w-full bg-bg border border-theme px-4 py-2.5 text-xs text-fg focus:outline-none focus:border-fg" />
            <input type="text" placeholder="Postal Code" onChange={(e) => setShipping({...shipping, postalCode: e.target.value})} className="w-full bg-bg border border-theme px-4 py-2.5 text-xs text-fg focus:outline-none focus:border-fg" />
          </div>
          <Button onClick={() => setStep('REVIEW')} className="w-full uppercase font-mono tracking-wider text-xs py-4 mt-2">
            Advance to Allocation Review
          </Button>
        </div>
      )}

      {step === 'REVIEW' && (
        <div className="space-y-6">
          <div className="border-b border-theme/40 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-fg-subtle block">Step 04 // Ledger Review</span>
            <Text role="headingSm" as="h3" className="uppercase tracking-wide">Review Allocation Lock</Text>
          </div>
          <div className="font-mono text-xs space-y-2 text-fg-muted">
            <div className="flex justify-between"><span className="uppercase">Garment:</span><span className="text-fg font-medium">{piece.title} (Size {size})</span></div>
            <div className="flex justify-between"><span className="uppercase">Volume Count:</span><span className="text-fg">{quantity} Pcs</span></div>
            <div className="flex justify-between"><span className="uppercase">Destination:</span><span className="text-fg">{shipping.city}, {shipping.province}</span></div>
            <div className="flex justify-between border-t border-theme/20 pt-2 text-sm font-bold"><span className="uppercase text-fg">Valuation Total:</span><span className="text-fg">₹{(piece.price * quantity).toLocaleString('en-IN')}</span></div>
          </div>
          <div className="bg-bg p-3 border border-dashed border-theme flex justify-between items-center text-[10px] font-mono">
            <span className="text-accent-strong font-bold uppercase tracking-wider">🔒 Reservation Hold Secured</span>
            <span className="text-fg-subtle">05:00 Mins</span>
          </div>
          <Button onClick={() => setStep('SUCCESS')} className="w-full uppercase font-mono tracking-wider text-xs py-4 bg-fg text-bg hover:bg-fg/90">
            Confirm House Reservation
          </Button>
        </div>
      )}

      {step === 'SUCCESS' && (
        <div className="text-center py-4 space-y-6">
          <div className="h-10 w-10 rounded-full border border-accent-strong flex items-center justify-center mx-auto">
            <span className="text-accent-strong text-xs">✓</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg uppercase font-light tracking-wide text-fg">Allocation Secured</h3>
            <p className="text-[10px] font-mono text-fg-subtle">Sequence ID: <span className="text-fg font-bold">VAL-26A91</span></p>
          </div>
          <p className="text-xs text-fg-muted max-w-xs mx-auto leading-relaxed">
            Your allocation is committed to the House Registry. We will dispatch status tracking details once the validation window closes.
          </p>
          <div className="pt-2">
            <a href="/registry/dashboard" className="text-[10px] font-mono uppercase tracking-wider text-fg border-b border-fg pb-0.5 hover:text-fg-subtle transition-colors">
              Enter Registry Portal →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}