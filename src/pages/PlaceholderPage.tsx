import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-accent/10 p-4 rounded-full mb-4">
        <Construction className="h-8 w-8 text-accent" />
      </div>
      <h1 className="text-2xl font-display font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        {description || "Este módulo será implementado em breve."}
      </p>
    </div>
  );
}
