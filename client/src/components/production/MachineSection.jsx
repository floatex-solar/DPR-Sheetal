// components/production/MachineSection.jsx
import React, { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
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

import { ChevronDown, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../../assets/axios";
import ItemEntry from "./ItemEntry";

const MachineSection = ({ index, typeName, machine, onChange, onDelete }) => {
  const [machines, setMachines] = useState([]); // options list from API
  const [availableItems, setAvailableItems] = useState([]); // items for selected machine type

  const [open, setOpen] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { machineId, entries } = machine;

  /** =====================
   *  FETCH MACHINES FOR TYPE
   *  ===================== */
  useEffect(() => {
    if (!typeName) {
      setMachines([]);
      return;
    }

    api
      .get(`/machines?type=${typeName}`)
      .then((res) => {
        setMachines(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch machines:", err);
      });
  }, [typeName]);

  const selectedMachine = machines.find((m) => m.id?.toString() === machineId);

  /** =====================
   *  FETCH ITEMS BASED ON MACHINE TYPE
   *  ===================== */
  useEffect(() => {
    if (!machineId) {
      setAvailableItems([]);
      return;
    }

    if (!selectedMachine) return;

    const fetchItems = async () => {
      try {
        const res = await api.get(`/items?type=${selectedMachine.type}`);
        setAvailableItems(res.data);
      } catch (err) {
        console.error("Failed to fetch items for machine:", err);
      }
    };

    fetchItems();
  }, [machineId, selectedMachine]);

  /** Update helpers */
  const handleMachineChange = (newMachineId) => {
    const selected = machines.find((m) => m.id.toString() === newMachineId);

    onChange({
      ...machine,
      machineId: newMachineId,
      machine: selected || null,
      entries: [], // reset entries when machine changes
    });
  };

  const addEntry = () => {
    onChange({
      ...machine,
      entries: [
        ...entries,
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
      ],
    });
  };

  const updateEntry = (entryIndex, updatedEntry) => {
    onChange({
      ...machine,
      entries: entries.map((e, i) => (i === entryIndex ? updatedEntry : e)),
    });
  };

  const deleteEntry = (entryIndex) => {
    onChange({
      ...machine,
      entries: entries.filter((_, idx) => idx !== entryIndex),
    });
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 678;

  return (
    <>
      <Card className="p-2 sm:p-3 border">
        <Collapsible open={open} onOpenChange={setOpen}>
          {/* HEADER */}
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center bg-gray-600 text-white px-3 rounded-md cursor-pointer">
              <span className="text-sm font-medium">
                Machine {index + 1}{" "}
                {selectedMachine ? `— ${selectedMachine.name}` : ""}
              </span>

              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
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
                  className="text-red-300 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>

          {/* BODY */}
          <CollapsibleContent>
            {/* MACHINE SELECT */}
            <div className="mt-2 mb-4 space-y-3">
              <label className="text-sm font-medium">Select Machine</label>
              <Select value={machineId} onValueChange={handleMachineChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose machine" />
                </SelectTrigger>

                <SelectContent>
                  {machines.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name} ({m.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DESKTOP GRID HEADER */}
            {entries.length > 0 && (
              <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr_20px] gap-2 items-center bg-gray-200 text-xs font-medium px-3 py-2 mb-2 rounded">
                <p>Category</p>
                <p>Sub Category</p>
                <p>Size</p>
                <p>UOM</p>
                <p>OK Qty</p>
                <p>OK Wt</p>
                <p>Rej Qty</p>
                <p>Rej Wt</p>
                <p></p>
              </div>
            )}

            {/* ENTRY LIST */}
            <div className="space-y-3">
              {entries.map((entry, entryIndex) => (
                <ItemEntry
                  key={entryIndex}
                  index={entryIndex}
                  entry={entry}
                  availableItems={availableItems}
                  mobile={isMobile}
                  onChange={(updated) => updateEntry(entryIndex, updated)}
                  onDelete={() => deleteEntry(entryIndex)}
                />
              ))}

              {/* ADD ENTRY BUTTON */}
              <Button
                onClick={addEntry}
                disabled={!machineId}
                className="w-full sm:w-fit bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item Entry
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* DELETE MACHINE CONFIRM */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Machine Section {index + 1}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This machine section will be removed permanently. This action
              cannot be undone.
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

export default MachineSection;
