// components/production/ItemEntry.jsx
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../../assets/axios";

const ItemEntry = ({
  index,
  typeName,
  initialData,
  onChange,
  onDelete,
  mobile = false, // MachineSection passes this flag
  availableItems = [], // passed from MachineSection
}) => {
  /** Local state */
  const [category, setCategory] = useState(initialData.category || "");
  const [subCategory, setSubCategory] = useState(initialData.subCategory || "");
  const [size, setSize] = useState(initialData.size || "");
  const [uom, setUom] = useState(initialData.uom || "");
  const [okQty, setOkQty] = useState(initialData.okQty || "");
  const [okWeight, setOkWeight] = useState(initialData.okWeight || "");
  const [rejectedQty, setRejectedQty] = useState(initialData.rejectedQty || "");
  const [rejectedWeight, setRejectedWeight] = useState(
    initialData.rejectedWeight || ""
  );

  const [open, setOpen] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /** Derived lists */
  const categories = [...new Set(availableItems.map((i) => i.category))].sort();

  const subCategories =
    category.length > 0
      ? [
          ...new Set(
            availableItems
              .filter((i) => i.category === category)
              .map((i) => i.subCategory)
          ),
        ].sort()
      : [];

  const sizes =
    subCategory.length > 0
      ? [
          ...new Set(
            availableItems
              .filter(
                (i) => i.category === category && i.subCategory === subCategory
              )
              .map((i) => i.size)
          ),
        ].sort()
      : [];

  /** Emit updated entry data */
  useEffect(() => {
    onChange({
      category,
      subCategory,
      size,
      uom,
      okQty,
      okWeight,
      rejectedQty,
      rejectedWeight,
    });
  }, [
    category,
    subCategory,
    size,
    uom,
    okQty,
    okWeight,
    rejectedQty,
    rejectedWeight,
  ]);

  /** ---------- DESKTOP LAYOUT ---------- */
  if (!mobile) {
    return (
      <>
        {/* Desktop row */}
        <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center mb-2">
          {/* Category */}
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setSubCategory("");
              setSize("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* SubCategory */}
          <Select
            value={subCategory}
            onValueChange={(v) => {
              setSubCategory(v);
              setSize("");
            }}
            disabled={!category}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="SubCategory" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((sc) => (
                <SelectItem key={sc} value={sc}>
                  {sc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Size */}
          <Select value={size} onValueChange={setSize} disabled={!subCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* UOM */}
          <Select value={uom} onValueChange={setUom}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="UOM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kg">Kg</SelectItem>
              <SelectItem value="Nos">Nos</SelectItem>
            </SelectContent>
          </Select>

          {/* OK Qty */}
          <Input
            type="number"
            value={okQty}
            onChange={(e) => setOkQty(e.target.value)}
            placeholder="0"
          />

          {/* OK Weight */}
          <Input
            type="number"
            value={okWeight}
            onChange={(e) => setOkWeight(e.target.value)}
            placeholder="0"
          />

          {/* Rejected Qty */}
          <Input
            type="number"
            value={rejectedQty}
            onChange={(e) => setRejectedQty(e.target.value)}
            placeholder="0"
          />

          {/* Rejected Weight */}
          <Input
            type="number"
            value={rejectedWeight}
            onChange={(e) => setRejectedWeight(e.target.value)}
            placeholder="0"
          />

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Delete popup */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry {index + 1}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this entry? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  /** ---------- MOBILE COLLAPSIBLE LAYOUT ---------- */

  return (
    <>
      <Card className="block sm:hidden p-2 sm:p-0">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center bg-gray-600 text-white px-3 rounded-md cursor-pointer">
              <span className="text-sm font-medium">Entry {index + 1}</span>
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    open && "rotate-180"
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setSubCategory("");
                  setSize("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* SubCategory */}
              <Select
                value={subCategory}
                onValueChange={(v) => {
                  setSubCategory(v);
                  setSize("");
                }}
                disabled={!category}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="SubCat" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((sc) => (
                    <SelectItem key={sc} value={sc}>
                      {sc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Size */}
              <Select
                value={size}
                onValueChange={setSize}
                disabled={!subCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* UOM */}
              <Select value={uom} onValueChange={setUom}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="UOM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kg">Kg</SelectItem>
                  <SelectItem value="Nos">Nos</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="OK Qty"
                value={okQty}
                onChange={(e) => setOkQty(e.target.value)}
              />

              <Input
                type="number"
                placeholder="OK Wt"
                value={okWeight}
                onChange={(e) => setOkWeight(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Rej Qty"
                value={rejectedQty}
                onChange={(e) => setRejectedQty(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Rej Wt"
                value={rejectedWeight}
                onChange={(e) => setRejectedWeight(e.target.value)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry {index + 1}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ItemEntry;
