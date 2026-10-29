import { useState } from "react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/explore" }) {
  const [showImage, setShowImage] = useState(true);
  return (
    <Link to={to} className="flex items-center gap-space-xs">
      {showImage && (
        <img
          src="/logo.png"
          alt=""
          className="h-8 w-auto object-contain"
          onError={() => setShowImage(false)}
        />
      )}
      <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight uppercase">
        GigCraft
      </span>
    </Link>
  );
}