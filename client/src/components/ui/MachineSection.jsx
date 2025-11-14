// MachineSection.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, ChevronsUpDown, Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../../assets/axios";

const Combobox = React.forwardRef(
  ({ options, value, onChange, placeholder, disabled = false }, ref) => {
    const [open, setOpen] = useState(false);

    if (disabled) {
      return (
        <div className="space-y-2">
          {/* <Label>{placeholder}</Label> */}
          <Input
            value={value}
            readOnly
            className="bg-gray-100"
            placeholder={placeholder}
          />
        </div>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            role="combobox"
            variant="outline"
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
          >
            {value ? value : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
            />
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  value={option}
                  key={option}
                  onSelect={() => {
                    onChange(option === value ? "" : option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

Combobox.displayName = "Combobox";

const MachineSection = forwardRef(
  ({ index, machines, onRequestRemove }, ref) => {
    const [machineId, setMachineId] = useState("");
    const [availableItems, setAvailableItems] = useState([]);
    const [productionEntries, setProductionEntries] = useState([]);
    const [open, setOpen] = useState(true);
    const [entryOpens, setEntryOpens] = useState([]);
    const [showEntryConfirm, setShowEntryConfirm] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const selectedMachine = useMemo(
      () => machines.find((m) => m.id?.toString() === machineId) || null,
      [machineId, machines]
    );

    useImperativeHandle(ref, () => ({
      getData: () => ({
        machineId: machineId || null,
        machine: selectedMachine
          ? {
              id: selectedMachine.id ?? null,
              name: selectedMachine.name ?? null,
              type: selectedMachine.type ?? null,
            }
          : null,
        productionEntries,
      }),
    }));

    const fetchItemsByMachineType = async (machineType) => {
      try {
        const res = await api.get(`/items?machineType=${machineType}`);
        return res.data; // Assume returns [{ id: "SWT-GR8-500", category: "BLOW TANKS", subCategory: "GR8 WATER TANK (8 LAYER)", size: "500LTR" }, ...]
      } catch (err) {
        console.error("Failed to fetch machine items:", err);
        return [];
      }
    };

    useEffect(() => {
      const fetchItems = async () => {
        if (!machineId) {
          setAvailableItems([]);
          setProductionEntries([]);
          return;
        }
        if (!selectedMachine) {
          setAvailableItems([]);
          setProductionEntries([]);
          return;
        }
        setProductionEntries([]);
        const items = await fetchItemsByMachineType(selectedMachine.type);
        setAvailableItems(items);
      };
      fetchItems();
    }, [machineId, machines, selectedMachine]);

    useEffect(() => {
      setEntryOpens((prev) => {
        const newOpens = [...prev];
        while (newOpens.length < productionEntries.length) {
          newOpens.push(true);
        }
        return newOpens.slice(0, productionEntries.length);
      });
    }, [productionEntries.length]);

    const categories = useMemo(() => {
      if (availableItems.length === 0) return [];
      return [...new Set(availableItems.map((item) => item.category))].sort();
    }, [availableItems]);

    const addProductionEntry = () => {
      setProductionEntries((prev) => [
        ...prev,
        {
          category: "",
          subCategory: "",
          size: "",
          uom: "",
          okQty: "",
          okWeight: "",
          rejectedQty: "",
          rejectedWeight: "",
        },
      ]);
      setEntryOpens((prev) => [...prev, true]);
    };

    const requestDeleteEntry = (entryIndex) => {
      setEntryToDelete(entryIndex);
      setShowEntryConfirm(true);
    };

    const confirmDeleteEntry = () => {
      if (entryToDelete !== null) {
        setProductionEntries((prev) =>
          prev.filter((_, i) => i !== entryToDelete)
        );
        setEntryOpens((prev) => prev.filter((_, i) => i !== entryToDelete));
      }
      setShowEntryConfirm(false);
      setEntryToDelete(null);
    };

    const removeProductionEntry = (entryIndex) => {
      setProductionEntries((prev) => prev.filter((_, i) => i !== entryIndex));
      setEntryOpens((prev) => prev.filter((_, i) => i !== entryIndex));
    };

    const updateProductionEntryField = (entryIndex, field, value) => {
      setProductionEntries((prev) =>
        prev.map((item, i) =>
          i === entryIndex ? { ...item, [field]: value } : item
        )
      );
    };

    return (
      <>
        <Card className="p-2">
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center px-2 cursor-pointer">
                <div className="flex items-center gap-2 bg-gray-600 text-white px-2 rounded-full">
                  <span className="text-sm font-medium">
                    Machine {index + 1}{" "}
                    {selectedMachine ? `- ${selectedMachine.name}` : ""}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform shrink-0",
                      open && "rotate-180"
                    )}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestRemove(index);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="">
              {/* Machine Select */}
              <div className="space-y-2 p-3 sm:p-4">
                <Label>Select Machine</Label>
                <Select value={machineId} onValueChange={setMachineId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem
                        key={machine.id}
                        value={machine.id.toString()}
                      >
                        {machine.name} ({machine.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden sm:block px-3 sm:px-4">
                <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr_20px] gap-2 py-2 bg-gray-200 rounded-md text-xs font-medium">
                  <p className="pl-2">Item Category</p>
                  <p>Item Sub Category</p>
                  <p>Item Size</p>
                  <p>UOM</p>
                  <p>OK Qty</p>
                  <p>OK Weight</p>
                  <p>Rej. Qty</p>
                  <p>Rej. Weight</p>
                  <p></p>
                </div>
              </div>

              {/* Production Entries */}
              <div className="space-y-3 p-3 sm:p-4">
                <Label className="block sm:hidden">Production Entries</Label>
                {productionEntries.map((item, iIndex) => {
                  const subCategories = item.category
                    ? [
                        ...new Set(
                          availableItems
                            .filter((it) => it.category === item.category)
                            .map((it) => it.subCategory)
                        ),
                      ].sort()
                    : [];
                  const sizes = item.subCategory
                    ? [
                        ...new Set(
                          availableItems
                            .filter(
                              (it) =>
                                it.category === item.category &&
                                it.subCategory === item.subCategory
                            )
                            .map((it) => it.size)
                        ),
                      ].sort()
                    : [];

                  return (
                    <Card
                      key={iIndex}
                      className="p-3 sm:p-0 sm:border-none sm:shadow-none"
                    >
                      <div className="block sm:hidden">
                        <Collapsible
                          open={entryOpens[iIndex] || false}
                          onOpenChange={(o) => {
                            setEntryOpens((prev) => {
                              const newO = [...prev];
                              newO[iIndex] = o;
                              return newO;
                            });
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <div
                              className={cn(
                                "flex justify-between items-center cursor-pointer",
                                entryOpens[iIndex] && "mb-3"
                              )}
                            >
                              <h4 className="font-medium text-xs flex gap-2 text-white bg-gray-600 rounded-full px-3 py-1">
                                Entry {iIndex + 1}
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform shrink-0",
                                    entryOpens[iIndex] && "rotate-180"
                                  )}
                                />
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDeleteEntry(iIndex);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 mt-2">
                            <div className="grid grid-cols-2 gap-4 sm:gap-2">
                              {/* Item Category */}
                              <div className="space-y-2 col-span-2 sm:col-span-1">
                                <Label className="block sm:hidden">
                                  Item Category
                                </Label>
                                <Combobox
                                  options={categories}
                                  value={item.category}
                                  onChange={(val) => {
                                    updateProductionEntryField(
                                      iIndex,
                                      "category",
                                      val
                                    );
                                    updateProductionEntryField(
                                      iIndex,
                                      "subCategory",
                                      ""
                                    );
                                    updateProductionEntryField(
                                      iIndex,
                                      "size",
                                      ""
                                    );
                                  }}
                                  placeholder="Select Item Category"
                                />
                              </div>

                              {/* Item Sub Category */}
                              <div className="space-y-2 col-span-2 sm:col-span-1">
                                <Label className="block sm:hidden">
                                  Item Sub Category
                                </Label>
                                <Combobox
                                  options={subCategories}
                                  value={item.subCategory}
                                  onChange={(val) => {
                                    updateProductionEntryField(
                                      iIndex,
                                      "subCategory",
                                      val
                                    );
                                    updateProductionEntryField(
                                      iIndex,
                                      "size",
                                      ""
                                    );
                                  }}
                                  placeholder="Select Item Sub Category"
                                  disabled={!item.category}
                                />
                              </div>

                              {/* Item Size */}
                              <div className="space-y-2 col-span-2 sm:col-span-1">
                                <Label className="block sm:hidden">
                                  Item Size
                                </Label>
                                <Combobox
                                  options={sizes}
                                  value={item.size}
                                  onChange={(val) =>
                                    updateProductionEntryField(
                                      iIndex,
                                      "size",
                                      val
                                    )
                                  }
                                  placeholder="Select Item Size"
                                  disabled={!item.subCategory}
                                />
                              </div>

                              {/* UOM */}
                              <div className="space-y-2 col-span-2 sm:col-span-1">
                                <Label className="block sm:hidden">UOM</Label>
                                <Select
                                  value={item.uom}
                                  onValueChange={(val) =>
                                    updateProductionEntryField(
                                      iIndex,
                                      "uom",
                                      val
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select UOM" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Kg">Kg</SelectItem>
                                    <SelectItem value="Nos">Nos</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* OK Qty */}
                              <div className="space-y-2">
                                <Label className="block sm:hidden">
                                  OK Qty
                                </Label>
                                <Input
                                  type="number"
                                  value={item.okQty}
                                  onChange={(e) =>
                                    updateProductionEntryField(
                                      iIndex,
                                      "okQty",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>

                              {/* OK Weight */}
                              <div className="space-y-2">
                                <Label className="block sm:hidden">
                                  OK Weight
                                </Label>
                                <Input
                                  type="number"
                                  value={item.okWeight}
                                  onChange={(e) =>
                                    updateProductionEntryField(
                                      iIndex,
                                      "okWeight",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>

                              {/* Rejected Qty */}
                              <div className="space-y-2">
                                <Label className="block sm:hidden">
                                  Rejected Qty
                                </Label>
                                <Input
                                  type="number"
                                  value={item.rejectedQty}
                                  onChange={(e) =>
                                    updateProductionEntryField(
                                      iIndex,
                                      "rejectedQty",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>

                              {/* Rejected Weight */}
                              <div className="space-y-2">
                                <Label className="block sm:hidden">
                                  Rejected Weight
                                </Label>
                                <Input
                                  type="number"
                                  value={item.rejectedWeight}
                                  onChange={(e) =>
                                    updateProductionEntryField(
                                      iIndex,
                                      "rejectedWeight",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>
                              {/* <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => requestDeleteEntry(iIndex)}
                                className="text-red-500 hover:text-red-700 col-span-2 sm:col-span-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button> */}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      <div className="hidden sm:block">
                        <div className="flex sm:hidden justify-between items-center mb-3">
                          <h4 className="font-medium">Entry {iIndex + 1}</h4>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => requestDeleteEntry(iIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr_20px] gap-4 sm:gap-2">
                          {/* Item Category */}
                          <div className="space-y-2">
                            <Combobox
                              options={categories}
                              value={item.category}
                              onChange={(val) => {
                                updateProductionEntryField(
                                  iIndex,
                                  "category",
                                  val
                                );
                                updateProductionEntryField(
                                  iIndex,
                                  "subCategory",
                                  ""
                                );
                                updateProductionEntryField(iIndex, "size", "");
                              }}
                              placeholder="Select Item Category"
                            />
                          </div>

                          {/* Item Sub Category */}
                          <div className="space-y-2">
                            <Combobox
                              options={subCategories}
                              value={item.subCategory}
                              onChange={(val) => {
                                updateProductionEntryField(
                                  iIndex,
                                  "subCategory",
                                  val
                                );
                                updateProductionEntryField(iIndex, "size", "");
                              }}
                              placeholder="Select Item Sub Category"
                              disabled={!item.category}
                            />
                          </div>

                          {/* Item Size */}
                          <div className="space-y-2">
                            <Combobox
                              options={sizes}
                              value={item.size}
                              onChange={(val) =>
                                updateProductionEntryField(iIndex, "size", val)
                              }
                              placeholder="Select Item Size"
                              disabled={!item.subCategory}
                            />
                          </div>

                          {/* UOM */}
                          <div className="space-y-2">
                            <Select
                              value={item.uom}
                              onValueChange={(val) =>
                                updateProductionEntryField(iIndex, "uom", val)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select UOM" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Kg">Kg</SelectItem>
                                <SelectItem value="Nos">Nos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* OK Qty */}
                          <div className="space-y-2">
                            <Input
                              type="number"
                              value={item.okQty}
                              onChange={(e) =>
                                updateProductionEntryField(
                                  iIndex,
                                  "okQty",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          {/* OK Weight */}
                          <div className="space-y-2">
                            <Input
                              type="number"
                              value={item.okWeight}
                              onChange={(e) =>
                                updateProductionEntryField(
                                  iIndex,
                                  "okWeight",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          {/* Rejected Qty */}
                          <div className="space-y-2">
                            <Input
                              type="number"
                              value={item.rejectedQty}
                              onChange={(e) =>
                                updateProductionEntryField(
                                  iIndex,
                                  "rejectedQty",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          {/* Rejected Weight */}
                          <div className="space-y-2">
                            <Input
                              type="number"
                              value={item.rejectedWeight}
                              onChange={(e) =>
                                updateProductionEntryField(
                                  iIndex,
                                  "rejectedWeight",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => requestDeleteEntry(iIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                <Button
                  variant=""
                  onClick={addProductionEntry}
                  className="w-full sm:w-fit bg-blue-600 hover:bg-blue-700 text-white sm:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Production Entry
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <AlertDialog open={showEntryConfirm} onOpenChange={setShowEntryConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete Entry{" "}
                {entryToDelete !== null ? entryToDelete + 1 : ""}? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteEntry}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

MachineSection.displayName = "MachineSection";

export default MachineSection;
