"use client";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  code: string;
}

export function SessionQRCode({ code }: Props) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${code}`;
  return (
    <div className="flex justify-center">
      <QRCodeSVG
        value={url}
        size={200}
        bgColor="#ffffff"
        fgColor="#1d4ed8"
        level="M"
      />
    </div>
  );
}
