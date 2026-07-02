"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrDisplayProps {
  url: string;
  code: string;
}

export function QrDisplay({ url, code }: QrDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 280, margin: 2 }).then(setDataUrl);
  }, [url]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt={`QR code for event ${code}`}
          className="rounded-xl border bg-white p-3"
        />
      ) : (
        <div className="h-[280px] w-[280px] animate-pulse rounded-xl bg-muted" />
      )}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Event code</p>
        <p className="text-3xl font-bold tracking-widest">{code}</p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <p className="truncate text-center text-sm text-muted-foreground">
          {url}
        </p>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Copy join link
        </button>
      </div>
    </div>
  );
}
