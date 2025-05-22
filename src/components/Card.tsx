import { HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;
type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;

export const CardHeader = ({ children, className = "", ...rest }: DivProps) => (
  <div className={`border-b pb-4 mb-4 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...rest }: HeadingProps) => (
  <h1 className={`text-xl font-bold ${className}`} {...rest}>
    {children}
  </h1>
);

export const CardDescription = ({ children, className = "", ...rest }: ParagraphProps) => (
  <p className={`text-gray-500 text-sm ${className}`} {...rest}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...rest }: DivProps) => (
  <div className={className} {...rest}>
    {children}
  </div>
);
