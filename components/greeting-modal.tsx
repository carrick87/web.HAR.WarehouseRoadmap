"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface GreetingModalProps {
  open: boolean;
  targetNumber: number | null;
  onClose: () => void;
  onSubmit: (greeting: string) => Promise<void>;
  loading?: boolean;
}

export function GreetingModal({
  open,
  targetNumber,
  onClose,
  onSubmit,
  loading,
}: GreetingModalProps) {
  const [greeting, setGreeting] = useState("");

  const handleSubmit = async () => {
    if (!greeting.trim()) return;
    await onSubmit(greeting.trim());
    setGreeting("");
  };

  const handleClose = () => {
    setGreeting("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send a greeting to #{targetNumber}</DialogTitle>
          <DialogDescription>
            Write a creative greeting for the person with this number.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={greeting}
          onChange={(e) => setGreeting(e.target.value.slice(0, 200))}
          placeholder="You are fantastic!"
          rows={4}
          maxLength={200}
        />
        <p className="text-right text-xs text-muted-foreground">
          {greeting.length}/200
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!greeting.trim() || loading}
          >
            {loading ? "Sending..." : "Send greeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
