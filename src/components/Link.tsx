import React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ children, ...props }) => {
  return (
    <a {...props} className="text-blue-500 hover:underline">
      {children}
    </a>
  );
};