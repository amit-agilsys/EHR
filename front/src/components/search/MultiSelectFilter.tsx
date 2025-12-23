import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "components/ui/separator";
import { Badge } from "components/ui/badge";

interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface MultiSelectFilterProps {
  title: string;
  options: FacetedFilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxDisplayCount?: number;
  mode?: "multi" | "single";
}

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onChange,
  searchable = true,
  searchPlaceholder,
  maxDisplayCount = 5,
  mode = "multi",
}: MultiSelectFilterProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const selectedSet = React.useMemo(
    () => new Set(selectedValues),
    [selectedValues]
  );

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Sort options: selected first, then unselected
  const sortedOptions = React.useMemo(() => {
    return [...filteredOptions].sort((a, b) => {
      const aSelected = selectedSet.has(a.value);
      const bSelected = selectedSet.has(b.value);

      // Selected items come first
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      // Maintain original order for items in the same group
      return 0;
    });
  }, [filteredOptions, selectedSet]);

  // Limit displayed options when not searching
  const displayedOptions = React.useMemo(() => {
    if (searchQuery.trim()) {
      return sortedOptions;
    }

    return sortedOptions.slice(0, maxDisplayCount);
  }, [sortedOptions, searchQuery, maxDisplayCount]);

  const hasMoreOptions = !searchQuery && sortedOptions.length > maxDisplayCount;

  const handleSelect = (value: string) => {
    if (mode === "single") {
      if (selectedSet.has(value)) {
        onChange([]); // Deselect if clicking the already selected value
      } else {
        onChange([value]); // Select new value
      }
      setOpen(false);
    } else {
      // Multi select: toggle selection
      const newSelectedValues = new Set(selectedSet);
      if (newSelectedValues.has(value)) {
        newSelectedValues.delete(value);
      } else {
        newSelectedValues.add(value);
      }
      onChange(Array.from(newSelectedValues));
    }
  };

  const handleClearFilters = () => {
    onChange([]);
    setSearchQuery("");
  };

  // const handleRemoveBadge = (value: string) => {
  //   const newValues = selectedValues.filter((v) => v !== value);
  //   onChange(newValues);
  // };

  const selectedLabels = React.useMemo(() => {
    return options
      .filter((option) => selectedSet.has(option.value))
      .map((option) => option.label);
  }, [options, selectedSet]);

  // Generate display text for button
  // const displayText = React.useMemo(() => {
  //   if (selectedValues.length === 0) {
  //     return title;
  //   }
  //   if (selectedValues.length > 2) {
  //     return `${selectedValues.length} selected`;
  //   }
  //   return options
  //     .filter((option) => selectedSet.has(option.value))
  //     .map((option) => option.label)
  //     .join(", ");
  // }, [selectedValues, options, selectedSet, title]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-0">
          <span className="capitalize">{title}</span>

          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {/* Mobile: Show count in badge */}
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.length}
              </Badge>

              {/* Desktop: Show labels or count */}
              <div className="hidden gap-1 lg:flex">
                {selectedValues.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  selectedLabels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="rounded-sm px-1 font-normal capitalize"
                    >
                      {label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          {searchable && (
            <CommandInput
              placeholder={searchPlaceholder || "Search..."}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          )}

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup>
              {displayedOptions.map((option) => {
                const isSelected = selectedSet.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    {mode === "multi" ? (
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-[4px] border mr-2",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-input [&_svg]:invisible"
                        )}
                      >
                        <Check className="size-3.5" />
                      </div>
                    ) : (
                      <div className="flex size-4 items-center justify-center mr-2">
                        {isSelected && <Check className="size-4" />}
                      </div>
                    )}

                    {option.icon && (
                      <option.icon className="text-muted-foreground size-4 mr-2" />
                    )}

                    <span className="capitalize flex-1">{option.label}</span>

                    {option.count !== undefined && (
                      <span className="text-muted-foreground ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}

              {hasMoreOptions && (
                <div className="text-muted-foreground px-2 py-1.5 text-center text-xs">
                  +{sortedOptions.length - maxDisplayCount} more (search to see
                  all)
                </div>
              )}
            </CommandGroup>

            {selectedValues.length > 0 && mode === "multi" && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClearFilters}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
