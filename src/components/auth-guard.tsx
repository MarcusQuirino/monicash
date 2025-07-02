"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface AuthGuardProps {
  children: React.ReactNode;
}

const validatePin = async (pin: string): Promise<boolean> => {
  if (!pin || pin.length !== 6) {
    throw new Error("PIN deve ter 6 dígitos");
  }

  const response = await fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("PIN incorreto");
    }
    throw new Error("Erro ao verificar PIN");
  }

  return true;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const [pin, setPin] = useState("");
  const [submittedPin, setSubmittedPin] = useState("");

  // React Query to validate the PIN
  const {
    data: isAuthenticated,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["auth", submittedPin],
    queryFn: () => validatePin(submittedPin),
    enabled: submittedPin.length === 6, // Only run when we have a 6-digit PIN
    retry: false, // Don't retry failed authentication attempts
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    staleTime: 1000 * 60 * 15, // Consider fresh for 15 minutes
  });

  const handlePinSubmit = () => {
    if (pin.length !== 6) {
      return;
    }
    setSubmittedPin(pin);
  };

  const handleLogout = () => {
    setPin("");
    setSubmittedPin("");
    // This will trigger a re-render and hide the authenticated content
  };

  // Show loading spinner during initial validation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Monicash</CardTitle>
            <p className="text-gray-600">Digite seu PIN para continuar</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={pin}
                onChange={(value) => {
                  setPin(value);
                }}
                onComplete={() => {
                  // Auto-submit when PIN is complete
                  setTimeout(() => {
                    setSubmittedPin(pin);
                  }, 100);
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="text-sm text-red-600 text-center">
                  {error instanceof Error
                    ? error.message
                    : "Erro ao verificar PIN"}
                </p>
              )}

              <Button
                onClick={handlePinSubmit}
                disabled={pin.length !== 6 || isLoading}
                className="w-full"
              >
                {isLoading ? "Verificando..." : "Entrar"}
              </Button>

              {error && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPin("");
                    setSubmittedPin("");
                  }}
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show authenticated content with logout button
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-white/80 backdrop-blur-sm"
        >
          Sair
        </Button>
      </div>
      {children}
    </div>
  );
}
