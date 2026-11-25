import { useState } from "react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/explore" }) {
  const [showImage, setShowImage] = useState(true);
  return (
    <Link to={to} className="flex items-center gap-space-xs group">
      {showImage && (
        <img
          src="/logo.png"
          alt="GigCraft"
          className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105"
          onError={() => setShowImage(false)}
        />
      )}
      <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight uppercase group-hover:text-primary-container transition-colors">
        GigCraft
      </span>
    </Link>
  );
}