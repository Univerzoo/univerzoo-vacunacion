import clsx from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-brown">{title}</h1>
        {description && (
          <p className="text-sm text-brand-brown-soft mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={clsx(
        "text-sm font-medium text-brand-brown mb-1 block",
        props.className
      )}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange-light disabled:opacity-60 disabled:bg-background",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange-light",
        props.className
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange-light bg-brand-surface",
        props.className
      )}
    />
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60",
        variant === "primary" &&
          "bg-brand-orange text-white hover:bg-brand-orange-dark",
        variant === "secondary" &&
          "bg-brand-orange-light text-brand-orange-dark hover:bg-brand-orange/20",
        variant === "danger" &&
          "bg-status-vencida-bg text-status-vencida hover:bg-status-vencida/20",
        variant === "ghost" &&
          "text-brand-brown-soft hover:bg-background border border-brand-border",
        className
      )}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-brand-orange text-white hover:bg-brand-orange-dark",
        variant === "secondary" &&
          "bg-brand-orange-light text-brand-orange-dark hover:bg-brand-orange/20",
        variant === "danger" &&
          "bg-status-vencida-bg text-status-vencida hover:bg-status-vencida/20",
        variant === "ghost" &&
          "text-brand-brown-soft hover:bg-background border border-brand-border",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-sm text-brand-brown-soft">
      {message}
    </div>
  );
}
