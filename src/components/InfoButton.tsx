import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface InfoButtonProps {
  content: string;
}

export const InfoButton = ({ content }: InfoButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full hover:bg-primary/10"
        >
          <HelpCircle className="h-4 w-4 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-xs">
        <p className="text-sm">{content}</p>
      </PopoverContent>
    </Popover>
  );
};
