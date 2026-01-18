"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnquiryCTAInlineProps {
  ctaTitle: string;
  onOpenModal: () => void;
}

export function EnquiryCTAInline({ ctaTitle, onOpenModal }: EnquiryCTAInlineProps) {
  return (
    <div className="my-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{ctaTitle}</h3>
            <p className="text-sm text-muted-foreground">
              Get in touch with us today
            </p>
          </div>
        </div>
        <Button onClick={onOpenModal} size="lg" className="whitespace-nowrap">
          {ctaTitle}
        </Button>
      </div>
    </div>
  );
}
