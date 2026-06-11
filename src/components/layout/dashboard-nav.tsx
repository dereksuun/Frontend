import {
  Banknote,
  BarChart3,
  CreditCard,
  Gauge,
  Landmark,
  PiggyBank,
  ReceiptText,
  Settings,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: Gauge },
  { href: "/rendas", label: "Rendas", icon: Banknote },
  { href: "/contas", label: "Contas", icon: ReceiptText },
  { href: "/cartoes", label: "Cartoes", icon: CreditCard },
  { href: "/gastos", label: "Gastos", icon: BarChart3 },
  { href: "/metas", label: "Metas", icon: PiggyBank },
  { href: "/posso-gastar", label: "Posso gastar", icon: ShieldCheck },
  { href: "/investimentos", label: "Investir", icon: Landmark },
  { href: "/indicadores", label: "Indicadores", icon: TrendingUp },
  { href: "/configuracoes", label: "Ajustes", icon: Settings }
];

type DashboardNavProps = {
  className?: string;
};

export function DashboardNav({ className }: DashboardNavProps) {
  return (
    <nav className={cn("overflow-x-auto rounded-lg border bg-card/80 p-2", className)} aria-label="Navegacao principal">
      <div className="flex min-w-max items-center gap-1">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
