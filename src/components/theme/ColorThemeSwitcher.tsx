import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme/ThemeProvider";

const colorThemes = [
  //default
  { name: "Neutral", value: "neutral", color: "bg-neutral-500" },
  // Cool
  { name: "Indigo", value: "indigo", color: "bg-indigo-500" },
  { name: "Blue", value: "blue", color: "bg-blue-500" },
  { name: "Violet", value: "violet", color: "bg-violet-500" },
  { name: "Green", value: "green", color: "bg-green-500" },
  // Neutral
  { name: "Zinc", value: "zinc", color: "bg-zinc-500" },
  { name: "Slate", value: "slate", color: "bg-slate-500" },
  // Warm
  { name: "Rose", value: "rose", color: "bg-rose-500" },
  { name: "Orange", value: "orange", color: "bg-orange-500" },
  { name: "Yellow", value: "yellow", color: "bg-yellow-500" },


] as const;


export function ColorThemeSwitcher() {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="hover:cursor-pointer">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {colorThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setColorTheme(theme.value)}
            className="flex items-center gap-2"
          >
            <div className={`w-4 h-4 rounded-md ${theme.color}`} />
            <span>{theme.name}</span>
            {colorTheme === theme.value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}