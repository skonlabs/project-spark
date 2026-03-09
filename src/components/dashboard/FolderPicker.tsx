import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, ChevronRight, Folder, FolderOpen, Package2, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface FolderOption {
  productId: string;
  productName: string;
  folderId: string | null; // null means product root
  folderName: string | null;
  itemCount?: number;
}

interface FolderPickerProps {
  products: Array<{
    id: string;
    name: string;
    folders: Array<{
      id: string;
      name: string;
      items: unknown[];
    }>;
  }>;
  selectedProductId: string;
  selectedFolderId: string | null;
  onSelect: (productId: string, folderId: string | null) => void;
  allowProductRoot?: boolean; // Allow selecting product root (for creating folders at root level)
  placeholder?: string;
  className?: string;
}

export function FolderPicker({
  products,
  selectedProductId,
  selectedFolderId,
  onSelect,
  allowProductRoot = false,
  placeholder = "Select folder...",
  className,
}: FolderPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    () => new Set(products.map((p) => p.id))
  );

  // Build flat list for search
  const allOptions = useMemo((): FolderOption[] => {
    const options: FolderOption[] = [];
    for (const product of products) {
      if (allowProductRoot) {
        options.push({
          productId: product.id,
          productName: product.name,
          folderId: null,
          folderName: null,
        });
      }
      for (const folder of product.folders) {
        options.push({
          productId: product.id,
          productName: product.name,
          folderId: folder.id,
          folderName: folder.name,
          itemCount: folder.items.length,
        });
      }
    }
    return options;
  }, [products, allowProductRoot]);

  // Filter options by search
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return allOptions;
    const q = search.toLowerCase();
    return allOptions.filter(
      (opt) =>
        opt.productName.toLowerCase().includes(q) ||
        (opt.folderName?.toLowerCase().includes(q) ?? false)
    );
  }, [allOptions, search]);

  // Group filtered options by product
  const groupedOptions = useMemo(() => {
    const groups: Record<string, FolderOption[]> = {};
    for (const opt of filteredOptions) {
      if (!groups[opt.productId]) groups[opt.productId] = [];
      groups[opt.productId].push(opt);
    }
    return groups;
  }, [filteredOptions]);

  // Get display label
  const selectedLabel = useMemo(() => {
    const selected = allOptions.find(
      (opt) => opt.productId === selectedProductId && opt.folderId === selectedFolderId
    );
    if (!selected) return placeholder;
    if (selected.folderId === null) return `${selected.productName} (root)`;
    return `${selected.productName} / ${selected.folderName}`;
  }, [allOptions, selectedProductId, selectedFolderId, placeholder]);

  function toggleProduct(productId: string) {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function handleSelect(opt: FolderOption) {
    onSelect(opt.productId, opt.folderId);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between gap-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-left hover:bg-accent/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{selectedLabel}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products and folders..."
              className="flex-1 h-10 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 && (
              <CommandEmpty>No folders found.</CommandEmpty>
            )}
            {Object.entries(groupedOptions).map(([productId, options]) => {
              const product = products.find((p) => p.id === productId);
              if (!product) return null;
              const isExpanded = expandedProducts.has(productId) || search.trim() !== "";
              const rootOpt = options.find((o) => o.folderId === null);
              const folderOpts = options.filter((o) => o.folderId !== null);

              return (
                <div key={productId} className="py-1">
                  {/* Product header */}
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent/50 rounded-sm mx-1"
                    onClick={() => toggleProduct(productId)}
                  >
                    <button className="text-muted-foreground/60">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <Package2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm flex-1">{product.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {product.folders.length} folders
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="ml-4">
                      {/* Product root option */}
                      {rootOpt && (
                        <CommandItem
                          value={`${productId}::root`}
                          onSelect={() => handleSelect(rootOpt)}
                          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                        >
                          <Package2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm flex-1">{product.name} (root)</span>
                          {selectedProductId === productId && selectedFolderId === null && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      )}

                      {/* Folders */}
                      {folderOpts.map((opt) => (
                        <CommandItem
                          key={opt.folderId}
                          value={`${productId}::${opt.folderId}`}
                          onSelect={() => handleSelect(opt)}
                          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                        >
                          <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm flex-1 truncate">{opt.folderName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {opt.itemCount ?? 0}
                          </span>
                          {selectedProductId === opt.productId &&
                            selectedFolderId === opt.folderId && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                        </CommandItem>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
